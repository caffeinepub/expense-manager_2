# Specification

## Summary
**Goal:** Fix the Add Expense form so that submitting a valid expense correctly calls the backend and saves the data.

**Planned changes:**
- Investigate and fix the wiring between the Add Expense form's submit handler and the existing `addExpense` backend function.
- Ensure successful submission shows a success message and resets all form fields to their default empty state.
- Display a clear error message to the user if the backend call fails.
- Verify client-side validation (non-empty title, positive numeric price, selected category) still runs correctly before submission.
- Ensure the newly added expense appears in the Dashboard expense list for the correct month after submission.

**User-visible outcome:** Users can fill in the Add Expense form and successfully submit expenses, which are then saved and visible in the Dashboard.
