/**
 * Test script for Schedule Blocks functionality
 * Tests the full flow: create blocks, check conflicts, delete blocks
 */

import { prisma } from '../config/prisma';
import { ScheduleBlockService } from '../services/schedule-block.service';
import { BookingService } from '../services/booking.service';

async function main() {
  console.log('🧪 Testing Schedule Blocks Functionality\n');
  console.log('='.repeat(50));

  try {
    // 1. Get or create a test manager and field
    console.log('\n📋 Step 1: Setting up test data...');
    
    let manager = await prisma.users.findFirst({
      where: { role: 'manager' }
    });

    if (!manager) {
      manager = await prisma.users.create({
        data: {
          email: 'test-manager-blocks@fulbo.com',
          first_name: 'Test',
          last_name: 'Manager',
          role: 'manager',
          password_hash: 'test123'
        }
      });
      console.log('   ✅ Created test manager:', manager.email);
    } else {
      console.log('   ✅ Using existing manager:', manager.email);
    }

    let field = await prisma.fields.findFirst({
      where: { owner_id: manager.user_id, deleted_at: null }
    });

    if (!field) {
      field = await prisma.fields.create({
        data: {
          owner_id: manager.user_id,
          name: 'Cancha Test Blocks',
          address: 'Av. Testing 123',
          base_price_per_hour: 100
        }
      });
      console.log('   ✅ Created test field:', field.name);
    } else {
      console.log('   ✅ Using existing field:', field.name);
    }

    // 2. Test creating a schedule block
    console.log('\n📋 Step 2: Creating a schedule block...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(12, 0, 0, 0);

    const blockResult = await ScheduleBlockService.createBlock(
      field.field_id,
      manager.user_id,
      {
        startTime: tomorrow,
        endTime: tomorrowEnd,
        reason: 'maintenance',
        note: 'Test maintenance block'
      }
    );

    if ('error' in blockResult) {
      console.log('   ⚠️ Block creation returned:', blockResult.error);
    } else {
      console.log('   ✅ Created block:', {
        id: blockResult.block.block_id,
        reason: blockResult.block.reason,
        startTime: blockResult.block.start_time,
        endTime: blockResult.block.end_time
      });
    }

    // 3. Test fetching blocks
    console.log('\n📋 Step 3: Fetching schedule blocks...');
    
    const blocks = await ScheduleBlockService.getBlocksByField(
      field.field_id,
      manager.user_id
    );

    if (blocks) {
      console.log(`   ✅ Found ${blocks.length} block(s) for field:`);
      blocks.forEach(b => {
        console.log(`      - ${b.reason}: ${b.start_time.toISOString()} to ${b.end_time.toISOString()}`);
      });
    }

    // 4. Test isTimeSlotBlocked
    console.log('\n📋 Step 4: Testing time slot blocking...');
    
    const testTime = new Date(tomorrow);
    testTime.setHours(9, 0, 0, 0);
    const testTimeEnd = new Date(testTime);
    testTimeEnd.setHours(10, 0, 0, 0);

    const isBlocked = await ScheduleBlockService.isTimeSlotBlocked(
      field.field_id,
      testTime,
      testTimeEnd
    );
    console.log(`   ✅ Is 9:00-10:00 tomorrow blocked? ${isBlocked}`);

    // 5. Test booking conflict - try to create a booking during blocked time
    console.log('\n📋 Step 5: Testing booking during blocked time...');
    
    let player = await prisma.users.findFirst({
      where: { role: 'player' }
    });

    if (!player) {
      player = await prisma.users.create({
        data: {
          email: 'test-player-blocks@fulbo.com',
          first_name: 'Test',
          last_name: 'Player',
          role: 'player',
          password_hash: 'test123'
        }
      });
    }

    try {
      await BookingService.createBooking({
        userId: player.user_id,
        fieldId: field.field_id,
        startTime: testTime.toISOString(),
        endTime: testTimeEnd.toISOString(),
        totalPrice: 100
      });
      console.log('   ❌ ERROR: Booking should have been rejected!');
    } catch (error: any) {
      if (error.message === 'HORARIO_BLOQUEADO') {
        console.log('   ✅ Booking correctly rejected: HORARIO_BLOQUEADO');
      } else {
        console.log('   ⚠️ Booking rejected with different error:', error.message);
      }
    }

    // 6. Test block conflict validation
    console.log('\n📋 Step 6: Testing block conflict validation...');
    
    // First create a confirmed booking for a different time
    const bookingTime = new Date();
    bookingTime.setDate(bookingTime.getDate() + 2);
    bookingTime.setHours(14, 0, 0, 0);
    const bookingTimeEnd = new Date(bookingTime);
    bookingTimeEnd.setHours(15, 0, 0, 0);

    const testBooking = await prisma.bookings.create({
      data: {
        player_id: player.user_id,
        field_id: field.field_id,
        start_time: bookingTime,
        end_time: bookingTimeEnd,
        total_price: 100,
        status: 'confirmed'
      }
    });
    console.log('   ✅ Created test booking for conflict test');

    // Now try to create a block that conflicts with this booking
    const conflictBlockResult = await ScheduleBlockService.createBlock(
      field.field_id,
      manager.user_id,
      {
        startTime: bookingTime,
        endTime: bookingTimeEnd,
        reason: 'personal',
        note: 'This should fail due to booking conflict'
      }
    );

    if ('error' in conflictBlockResult && conflictBlockResult.error === 'BOOKING_CONFLICTS') {
      console.log('   ✅ Block correctly rejected due to booking conflicts');
      console.log('   Conflicts:', conflictBlockResult.conflicts);
    } else if ('error' in conflictBlockResult) {
      console.log('   ⚠️ Block rejected with different error:', conflictBlockResult.error);
    } else {
      console.log('   ❌ ERROR: Block should have been rejected due to booking conflict!');
    }

    // 7. Test getting availability (for player view)
    console.log('\n📋 Step 7: Testing availability endpoint...');
    
    const startRange = new Date();
    startRange.setHours(0, 0, 0, 0);
    const endRange = new Date();
    endRange.setDate(endRange.getDate() + 7);
    endRange.setHours(23, 59, 59, 999);

    const blocksForAvailability = await ScheduleBlockService.getBlocksForAvailability(
      field.field_id,
      startRange,
      endRange
    );
    console.log(`   ✅ Found ${blocksForAvailability.length} blocks affecting availability`);

    // 8. Test deleting a block
    console.log('\n📋 Step 8: Testing block deletion...');
    
    if (blocks && blocks.length > 0) {
      const blockToDelete = blocks[0];
      const deleteResult = await ScheduleBlockService.deleteBlock(
        blockToDelete.block_id,
        manager.user_id
      );
      
      if (deleteResult) {
        console.log('   ✅ Successfully deleted block:', blockToDelete.block_id);
      } else {
        console.log('   ❌ Failed to delete block');
      }
    }

    // 9. Test overlapping block prevention
    console.log('\n📋 Step 9: Testing overlapping block prevention...');
    
    const overlapStart = new Date();
    overlapStart.setDate(overlapStart.getDate() + 3);
    overlapStart.setHours(10, 0, 0, 0);
    const overlapEnd = new Date(overlapStart);
    overlapEnd.setHours(14, 0, 0, 0);

    // Create first block
    const firstBlock = await ScheduleBlockService.createBlock(
      field.field_id,
      manager.user_id,
      {
        startTime: overlapStart,
        endTime: overlapEnd,
        reason: 'event',
        note: 'First block'
      }
    );

    if (!('error' in firstBlock)) {
      console.log('   ✅ Created first block');

      // Try to create overlapping block
      const overlapTest = new Date(overlapStart);
      overlapTest.setHours(12, 0, 0, 0);
      const overlapTestEnd = new Date(overlapTest);
      overlapTestEnd.setHours(16, 0, 0, 0);

      const overlapResult = await ScheduleBlockService.createBlock(
        field.field_id,
        manager.user_id,
        {
          startTime: overlapTest,
          endTime: overlapTestEnd,
          reason: 'maintenance',
          note: 'Overlapping block'
        }
      );

      if ('error' in overlapResult && overlapResult.error === 'BLOCK_OVERLAPS') {
        console.log('   ✅ Overlapping block correctly rejected');
      } else if ('error' in overlapResult) {
        console.log('   ⚠️ Rejected with different error:', overlapResult.error);
      } else {
        console.log('   ❌ ERROR: Overlapping block should have been rejected!');
      }

      // Cleanup first block
      await ScheduleBlockService.deleteBlock(firstBlock.block.block_id, manager.user_id);
    }

    // Cleanup
    console.log('\n📋 Cleanup: Removing test data...');
    await prisma.bookings.delete({ where: { booking_id: testBooking.booking_id } });
    console.log('   ✅ Cleaned up test booking');

    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ Schedule Blocks Test Suite Completed!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
