import { useManagerDashboard } from "./useManagerDashboard";
import {
  DashboardHeader,
  PeriodFilter,
  StatsSection,
  RevenueChart,
  TodaysBookings,
  FieldsList
} from "./components";
import {
  CustomDatePickerModal,
  FieldScheduleModal,
  EditMatchModal,
  ContactModal
} from "./modals";
import { ManagerDashboardProps } from "./types";

export function ManagerDashboard({ onNavigateToSchedule, onNavigateToFields }: ManagerDashboardProps) {
  const {
    timePeriod,
    dateRange,
    setDateRange,
    data,
    loading,
    modals,
    selectedField,
    selectedMatch,
    handlePeriodChange,
    applyCustomDateRange,
    saveMatch,
    openCustomDatePicker,
    closeCustomDatePicker,
    openFieldSchedule,
    closeFieldSchedule,
    openEditModal,
    closeEditModal,
    openContactModal,
    closeContactModal,
  } = useManagerDashboard();

  return (
    <div className="min-h-screen bg-white pb-20">
      <DashboardHeader />

      <div className="p-4 space-y-6">
        <PeriodFilter
          timePeriod={timePeriod}
          onPeriodChange={handlePeriodChange}
          onCustomClick={openCustomDatePicker}
          dateRange={dateRange}
        />

        <StatsSection
          stats={data.stats}
          loading={loading.stats}
          timePeriod={timePeriod}
        />

        <RevenueChart
          data={data.chartData}
          loading={loading.chart}
        />

        <TodaysBookings
          bookings={data.todayBookings}
          loading={loading.bookings}
          onViewAll={onNavigateToSchedule}
        />

        <FieldsList
          fields={data.fields}
          loading={loading.fields}
          onViewAll={onNavigateToFields}
          onViewSchedule={openFieldSchedule}
        />
      </div>

      {/* Modals */}
      <CustomDatePickerModal
        open={modals.showCustomDatePicker}
        onClose={closeCustomDatePicker}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onApply={applyCustomDateRange}
      />

      <FieldScheduleModal
        open={modals.showFieldSchedule}
        onClose={closeFieldSchedule}
        field={selectedField}
        bookings={data.todayBookings}
        onEditMatch={openEditModal}
        onContactMatch={openContactModal}
      />

      <EditMatchModal
        open={modals.showEditModal}
        onClose={closeEditModal}
        match={selectedMatch}
        onSave={saveMatch}
      />

      <ContactModal
        open={modals.showContactModal}
        onClose={closeContactModal}
        match={selectedMatch}
      />
    </div>
  );
}
