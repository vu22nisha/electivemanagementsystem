import unittest

from pydantic import ValidationError

from app.schemas import FacultyPreferenceRequest
from app.services import should_enforce_prerequisites


class RegistrationRulesTests(unittest.TestCase):
    def test_prerequisites_only_for_non_cse_students_on_cse_electives(self) -> None:
        self.assertTrue(should_enforce_prerequisites(student_branch_id=2, elective_branch_id=1))
        self.assertFalse(should_enforce_prerequisites(student_branch_id=1, elective_branch_id=1))
        self.assertFalse(should_enforce_prerequisites(student_branch_id=2, elective_branch_id=2))

    def test_faculty_preferences_require_three_ranked_choices(self) -> None:
        with self.assertRaises(ValidationError):
            FacultyPreferenceRequest(
                elective_1_prefs=["FAC001", "FAC002"],
                elective_2_prefs=["FAC001", "FAC002"],
            )

        valid = FacultyPreferenceRequest(
            elective_1_prefs=["FAC001", "FAC002", "FAC003"],
            elective_2_prefs=["FAC001", "FAC002", "FAC003"],
        )
        self.assertEqual(len(valid.elective_1_prefs), 3)
        self.assertEqual(len(valid.elective_2_prefs), 3)


if __name__ == "__main__":
    unittest.main()
