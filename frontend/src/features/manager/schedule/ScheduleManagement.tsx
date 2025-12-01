import { useScheduleManagement } from './hooks';
import {
  ScheduleHeader,
  QuickFilters,
  CalendarSection,
  BlocksList,
  MatchesList,
} from './components';
import {
  BlockScheduleModal,
  EditMatchModal,
  ContactModal,
  CreateReservationModal,
} from './modals';

export function ScheduleManagement() {
  const {
    // Date
    date,
    setDate,

    // Modals
    showEditModal,
    setShowEditModal,
    showContactModal,
    setShowContactModal,
    showCreateModal,
    setShowCreateModal,
    showBlockModal,
    setShowBlockModal,

    // Selected match
    selectedMatch,

    // Fields
    fields,
    loadingFields,

    // Matches
    matches,
    loadingMatches,

    // Schedule blocks
    blocksForSelectedDate,
    blockError,
    savingBlock,
    deletingBlockId,
    bookingConflicts,
    dateHasBlocks,

    // Forms
    newReservation,
    setNewReservation,
    newBlock,
    setNewBlock,

    // Match handlers
    handleEditMatch,
    handleContactMatch,
    handleSaveEdit,
    handleCallCustomer,
    handleEmailCustomer,
    handleOpenChat,

    // Reservation handlers
    handleCreateReservation,

    // Block handlers
    handleOpenBlockModal,
    handleCreateBlock,
    handleDeleteBlock,
  } = useScheduleManagement();

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4 space-y-6">
        {/* Header with Create Buttons */}
        <ScheduleHeader
          onOpenBlockModal={handleOpenBlockModal}
          onOpenCreateModal={() => setShowCreateModal(true)}
        />

        {/* Quick Filters */}
        <QuickFilters />

        {/* Calendar */}
        <CalendarSection date={date} onDateSelect={setDate} dateHasBlocks={dateHasBlocks} />

        {/* Schedule Blocks for Selected Date */}
        <BlocksList
          blocks={blocksForSelectedDate}
          date={date}
          deletingBlockId={deletingBlockId}
          onDeleteBlock={handleDeleteBlock}
        />

        {/* Matches List */}
        <MatchesList
          matches={matches}
          date={date}
          loading={loadingMatches}
          onEditMatch={handleEditMatch}
          onContactMatch={handleContactMatch}
        />
      </div>

      {/* Modals */}
      <BlockScheduleModal
        open={showBlockModal}
        onOpenChange={setShowBlockModal}
        fields={fields}
        loadingFields={loadingFields}
        newBlock={newBlock}
        onBlockChange={setNewBlock}
        blockError={blockError}
        bookingConflicts={bookingConflicts}
        savingBlock={savingBlock}
        onCreateBlock={handleCreateBlock}
      />

      <EditMatchModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        match={selectedMatch}
        fields={fields}
        onSave={handleSaveEdit}
      />

      <ContactModal
        open={showContactModal}
        onOpenChange={setShowContactModal}
        match={selectedMatch}
        onCallCustomer={handleCallCustomer}
        onEmailCustomer={handleEmailCustomer}
        onOpenChat={handleOpenChat}
      />

      <CreateReservationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        fields={fields}
        newReservation={newReservation}
        onReservationChange={setNewReservation}
        onCreateReservation={handleCreateReservation}
      />
    </div>
  );
}
