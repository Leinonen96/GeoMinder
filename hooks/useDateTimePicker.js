import { useState, useCallback } from 'react';

/**
 * Custom hook to manage date and time picker state
 * @param {Date} initialDate Initial date value (optional)
 * @param {Date} initialTime Initial time value (optional)
 * @returns {Object} Date, time, visibility states, and handler functions
 */
export function useDateTimePicker(initialDate = null, initialTime = null) {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const showDate = useCallback(() => setShowDatePicker(true), []);
  const showTime = useCallback(() => setShowTimePicker(true), []);

  const handleDateChange = useCallback((event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, []);

  const handleTimeChange = useCallback((event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  }, []);

  return {
    date,
    time,
    setDate,
    setTime,
    showDatePicker,
    showTimePicker,
    showDate,
    showTime,
    handleDateChange,
    handleTimeChange
  };
}
