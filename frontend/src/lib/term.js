// The redesign has no term picker -- the app answers for one quarter, the one
// the weekly sync loads into class_meetings. Change these when it rolls over.
//
// The API takes year and quarter separately; the DB stores them joined as
// "Fall 2026", QUARTER FIRST. Getting that order backwards matches zero rows
// and looks like an empty building rather than an error.
export const YEAR = "2026"
export const QUARTER = "Fall"
export const TERM_LABEL = `${QUARTER} ${YEAR}`
