// Khali filters (jem ke departmentId="") ne URL mathi kadhi nakhe,
// nahi to backend validation fail thay
export const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );