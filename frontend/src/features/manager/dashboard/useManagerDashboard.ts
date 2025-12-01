import { useState, useEffect, useCallback } from "react";
import { managerApi, Field, ManagerBooking } from "../../../services/manager.api";
import { TimePeriod, DateRange, DashboardState, DashboardLoadingState, ModalState } from "./types";

export function useManagerDashboard() {
  // Time period state
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');
  const [dateRange, setDateRange] = useState<DateRange>({});

  // Data state
  const [data, setData] = useState<DashboardState>({
    fields: [],
    stats: null,
    chartData: [],
    todayBookings: []
  });

  // Loading states
  const [loading, setLoading] = useState<DashboardLoadingState>({
    fields: true,
    stats: true,
    chart: true,
    bookings: true
  });

  // Modal states
  const [modals, setModals] = useState<ModalState>({
    showCustomDatePicker: false,
    showFieldSchedule: false,
    showEditModal: false,
    showContactModal: false
  });

  // Selected items
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<ManagerBooking | null>(null);

  // Fetch fields on mount
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(prev => ({ ...prev, fields: true }));
        const fields = await managerApi.fields.getAll();
        setData(prev => ({ ...prev, fields }));
      } catch (err) {
        console.error('Error fetching fields:', err);
      } finally {
        setLoading(prev => ({ ...prev, fields: false }));
      }
    };
    fetchFields();
  }, []);

  // Fetch stats when period changes
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(prev => ({ ...prev, stats: true }));
        const period = timePeriod === 'custom' ? 'all' : timePeriod;
        const stats = await managerApi.stats.get(period);
        setData(prev => ({ ...prev, stats }));
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    };
    fetchStats();
  }, [timePeriod]);

  // Fetch chart data on mount
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(prev => ({ ...prev, chart: true }));
        const chartData = await managerApi.stats.getChart(7);
        setData(prev => ({ ...prev, chartData }));
      } catch (err) {
        console.error('Error fetching chart data:', err);
      } finally {
        setLoading(prev => ({ ...prev, chart: false }));
      }
    };
    fetchChartData();
  }, []);

  // Fetch today's bookings
  useEffect(() => {
    const fetchTodayBookings = async () => {
      try {
        setLoading(prev => ({ ...prev, bookings: true }));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayBookings = await managerApi.bookings.getAll({
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString(),
        });
        setData(prev => ({ ...prev, todayBookings }));
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(prev => ({ ...prev, bookings: false }));
      }
    };
    fetchTodayBookings();
  }, []);

  // Modal handlers
  const openCustomDatePicker = useCallback(() => {
    setModals(prev => ({ ...prev, showCustomDatePicker: true }));
  }, []);

  const closeCustomDatePicker = useCallback(() => {
    setModals(prev => ({ ...prev, showCustomDatePicker: false }));
  }, []);

  const openFieldSchedule = useCallback((field: Field) => {
    setSelectedField(field);
    setModals(prev => ({ ...prev, showFieldSchedule: true }));
  }, []);

  const closeFieldSchedule = useCallback(() => {
    setModals(prev => ({ ...prev, showFieldSchedule: false }));
    setSelectedField(null);
  }, []);

  const openEditModal = useCallback((match: ManagerBooking) => {
    setSelectedMatch(match);
    setModals(prev => ({ ...prev, showEditModal: true }));
  }, []);

  const closeEditModal = useCallback(() => {
    setModals(prev => ({ ...prev, showEditModal: false }));
    setSelectedMatch(null);
  }, []);

  const openContactModal = useCallback((match: ManagerBooking) => {
    setSelectedMatch(match);
    setModals(prev => ({ ...prev, showContactModal: true }));
  }, []);

  const closeContactModal = useCallback(() => {
    setModals(prev => ({ ...prev, showContactModal: false }));
    setSelectedMatch(null);
  }, []);

  // Period change handler
  const handlePeriodChange = useCallback((period: TimePeriod) => {
    if (period === 'custom') {
      openCustomDatePicker();
    } else {
      setTimePeriod(period);
    }
  }, [openCustomDatePicker]);

  const applyCustomDateRange = useCallback(() => {
    setTimePeriod('custom');
    closeCustomDatePicker();
  }, [closeCustomDatePicker]);

  // Get field-specific bookings
  const getFieldBookings = useCallback(() => {
    if (!selectedField) return [];
    return data.todayBookings.filter(booking => booking.fieldId === selectedField.id);
  }, [selectedField, data.todayBookings]);

  // Save match handler (placeholder)
  const saveMatch = useCallback((match: ManagerBooking) => {
    console.log('Saving match:', match);
    closeEditModal();
  }, [closeEditModal]);

  return {
    // State
    timePeriod,
    dateRange,
    setDateRange,
    data,
    loading,
    modals,
    selectedField,
    selectedMatch,

    // Actions
    handlePeriodChange,
    applyCustomDateRange,
    getFieldBookings,
    saveMatch,

    // Modal controls
    openCustomDatePicker,
    closeCustomDatePicker,
    openFieldSchedule,
    closeFieldSchedule,
    openEditModal,
    closeEditModal,
    openContactModal,
    closeContactModal,
  };
}
