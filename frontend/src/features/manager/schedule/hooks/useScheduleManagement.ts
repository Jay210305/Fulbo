import { useState, useEffect, useCallback } from 'react';
import { ScheduleBlockApi, ApiError } from '../../../../services/api';
import api from '../../../../services/api';
import { managerApi } from '../../../../services/manager.api';
import {
  Match,
  Field,
  NewReservationForm,
  NewBlockForm,
  ScheduleBlock,
  ScheduleBlockReason,
  BookingConflict,
  INITIAL_RESERVATION_FORM,
  INITIAL_BLOCK_FORM,
  bookingToMatch,
} from '../types';

export function useScheduleManagement() {
  // Date selection
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Modal visibility
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Selected match for modals
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Fields state
  const [fields, setFields] = useState<Field[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);

  // Matches/Bookings state
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Schedule blocks state
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [savingBlock, setSavingBlock] = useState(false);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);
  const [bookingConflicts, setBookingConflicts] = useState<BookingConflict[]>([]);

  // Form states
  const [newReservation, setNewReservation] = useState<NewReservationForm>(INITIAL_RESERVATION_FORM);
  const [newBlock, setNewBlock] = useState<NewBlockForm>(INITIAL_BLOCK_FORM);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoadingFields(true);
        const response = await api.get<Array<{ id: string; name: string }>>('/manager/fields');
        setFields(response.map(f => ({ id: f.id, name: f.name })));
      } catch (error) {
        console.error('Error fetching fields:', error);
      } finally {
        setLoadingFields(false);
      }
    };
    fetchFields();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!date) return;

      try {
        setLoadingMatches(true);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await managerApi.bookings.getAll({
          startDate: startOfDay.toISOString().split('T')[0],
          endDate: endOfDay.toISOString().split('T')[0],
        });

        setMatches(bookings.map(bookingToMatch));
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    };
    fetchBookings();
  }, [date]);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 2);

        const blocks = await ScheduleBlockApi.getAll({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        setScheduleBlocks(blocks);
      } catch (error) {
        console.error('Error fetching schedule blocks:', error);
      }
    };
    fetchBlocks();
  }, []);

  // ============================================================================
  // Block Helpers
  // ============================================================================

  const dateHasBlocks = useCallback((checkDate: Date): boolean => {
    return scheduleBlocks.some(block => {
      const start = new Date(block.startTime);
      const end = new Date(block.endTime);
      const check = new Date(checkDate);
      check.setHours(12, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return check >= start && check <= end;
    });
  }, [scheduleBlocks]);

  const getBlocksForDate = useCallback((checkDate: Date | undefined): ScheduleBlock[] => {
    if (!checkDate) return [];
    return scheduleBlocks.filter(block => {
      const start = new Date(block.startTime);
      const end = new Date(block.endTime);
      const check = new Date(checkDate);
      check.setHours(12, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return check >= start && check <= end;
    });
  }, [scheduleBlocks]);

  const blocksForSelectedDate = getBlocksForDate(date);

  // ============================================================================
  // Match Handlers
  // ============================================================================

  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowEditModal(true);
  };

  const handleContactMatch = (match: Match) => {
    setSelectedMatch(match);
    setShowContactModal(true);
  };

  const handleSaveEdit = () => {
    alert('Reserva actualizada exitosamente');
    setShowEditModal(false);
    setSelectedMatch(null);
  };

  const handleCallCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailCustomer = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleOpenChat = () => {
    alert('Abriendo chat del partido...');
    setShowContactModal(false);
  };

  // ============================================================================
  // Reservation Handlers
  // ============================================================================

  const handleCreateReservation = () => {
    alert(`Reserva manual creada: ${newReservation.field} a las ${newReservation.time}`);
    setShowCreateModal(false);
    setNewReservation(INITIAL_RESERVATION_FORM);
  };

  // ============================================================================
  // Block Handlers
  // ============================================================================

  const handleOpenBlockModal = () => {
    setBlockError(null);
    setBookingConflicts([]);
    setNewBlock({
      fieldId: fields.length === 1 ? fields[0].id : '',
      startDate: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endDate: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endTime: '18:00',
      reason: '',
      note: '',
    });
    setShowBlockModal(true);
  };

  const handleCreateBlock = async () => {
    if (!newBlock.fieldId || !newBlock.startDate || !newBlock.startTime ||
        !newBlock.endDate || !newBlock.endTime || !newBlock.reason) {
      setBlockError('Por favor completa todos los campos obligatorios');
      return;
    }

    setSavingBlock(true);
    setBlockError(null);
    setBookingConflicts([]);

    try {
      const startTime = new Date(`${newBlock.startDate}T${newBlock.startTime}:00`);
      const endTime = new Date(`${newBlock.endDate}T${newBlock.endTime}:00`);

      if (startTime >= endTime) {
        setBlockError('La hora de inicio debe ser anterior a la hora de fin');
        setSavingBlock(false);
        return;
      }

      const response = await ScheduleBlockApi.create({
        fieldId: newBlock.fieldId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        reason: newBlock.reason as ScheduleBlockReason,
        note: newBlock.note || undefined,
      });

      setScheduleBlocks(prev => [...prev, response.block]);
      setShowBlockModal(false);
      setNewBlock(INITIAL_BLOCK_FORM);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          try {
            const errorData = JSON.parse(error.message);
            if (errorData.conflicts) {
              setBookingConflicts(errorData.conflicts);
              setBlockError('Existen reservas confirmadas en este rango de tiempo. Debes cancelarlas antes de crear el bloqueo.');
            } else {
              setBlockError(error.message);
            }
          } catch {
            setBlockError('Ya existe un bloqueo que se superpone con este rango de tiempo');
          }
        } else {
          setBlockError(error.message);
        }
      } else {
        setBlockError('Error al crear el bloqueo. Intenta nuevamente.');
      }
    } finally {
      setSavingBlock(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('¿Estás seguro de eliminar este bloqueo?')) return;

    setDeletingBlockId(blockId);
    try {
      await ScheduleBlockApi.delete(blockId);
      setScheduleBlocks(prev => prev.filter(b => b.id !== blockId));
    } catch (error) {
      console.error('Error deleting block:', error);
      alert('Error al eliminar el bloqueo');
    } finally {
      setDeletingBlockId(null);
    }
  };

  return {
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
    setSelectedMatch,

    // Fields
    fields,
    loadingFields,

    // Matches
    matches,
    loadingMatches,

    // Schedule blocks
    scheduleBlocks,
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
  };
}
