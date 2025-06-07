"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
    GET_ALL_COURSES,
    GET_UNASSIGNED_LECTURERS,
    CREATE_COURSE,
    UPDATE_COURSE,
    DELETE_COURSE,
    ASSIGN_LECTURER_TO_COURSE,
    REMOVE_LECTURER_FROM_COURSE,
} from "@/lib/graphql/queries";
import {
    AcademicCapIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    UserPlusIcon,
    UserMinusIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import styles from "./courses-management.module.css";

interface Course {
    id: number;
    courseCode: string;
    courseName: string;
    semester: string;
    description?: string;
    maxTutors: number;
    maxLabAssistants: number;
    createdAt: string;
    courseAssignments: Array<{
        id: number;
        lecturer: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
        };
    }>;
    applications: Array<{
        id: number;
        status: string;
    }>;
}

interface Lecturer {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

interface CourseFormData {
    courseCode: string;
    courseName: string;
    semester: string;
    description: string;
    maxTutors: number;
    maxLabAssistants: number;
}

export default function CoursesManagement() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState<CourseFormData>({
        courseCode: "",
        courseName: "",
        semester: "",
        description: "",
        maxTutors: 5,
        maxLabAssistants: 3,
    });

    const {
        data: coursesData,
        loading: coursesLoading,
        refetch: refetchCourses,
    } = useQuery(GET_ALL_COURSES);
    const { data: lecturersData, refetch: refetchLecturers } = useQuery(
        GET_UNASSIGNED_LECTURERS
    );

    const [createCourse] = useMutation(CREATE_COURSE, {
        onCompleted: () => {
            refetchCourses();
            setShowCreateModal(false);
            resetForm();
        },
    });

    const [updateCourse] = useMutation(UPDATE_COURSE, {
        onCompleted: () => {
            refetchCourses();
            setShowEditModal(false);
            resetForm();
        },
    });

    const [deleteCourse] = useMutation(DELETE_COURSE, {
        onCompleted: () => {
            refetchCourses();
            setShowDeleteModal(false);
            setSelectedCourse(null);
        },
    });

    const [assignLecturer] = useMutation(ASSIGN_LECTURER_TO_COURSE, {
        onCompleted: () => {
            refetchCourses();
            refetchLecturers();
            setShowAssignModal(false);
        },
    });

    const [removeLecturer] = useMutation(REMOVE_LECTURER_FROM_COURSE, {
        onCompleted: () => {
            refetchCourses();
            refetchLecturers();
        },
    });

    const courses = coursesData?.getAllCourses || [];
    const lecturers = lecturersData?.getUnassignedLecturers || [];

    const filteredCourses = courses.filter(
        (course: Course) =>
            course.courseCode
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            course.courseName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            course.semester.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            courseCode: "",
            courseName: "",
            semester: "",
            description: "",
            maxTutors: 5,
            maxLabAssistants: 3,
        });
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCourse({
                variables: {
                    input: {
                        ...formData,
                        maxTutors: Number(formData.maxTutors),
                        maxLabAssistants: Number(formData.maxLabAssistants),
                    },
                },
            });
        } catch (error) {
            console.error("Error creating course:", error);
        }
    };

    const handleUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) return;

        try {
            await updateCourse({
                variables: {
                    id: parseInt(selectedCourse.id.toString()),
                    input: {
                        ...formData,
                        maxTutors: Number(formData.maxTutors),
                        maxLabAssistants: Number(formData.maxLabAssistants),
                    },
                },
            });
        } catch (error) {
            console.error("Error updating course:", error);
        }
    };

    const handleDeleteCourse = async () => {
        if (!selectedCourse) return;

        try {
            await deleteCourse({
                variables: { id: parseInt(selectedCourse.id.toString()) },
            });
        } catch (error) {
            console.error("Error deleting course:", error);
        }
    };

    const handleAssignLecturer = async (lecturerId: number) => {
        if (!selectedCourse) return;

        try {
            await assignLecturer({
                variables: {
                    lecturerId: parseInt(lecturerId.toString()),
                    courseId: parseInt(selectedCourse.id.toString()),
                },
            });
        } catch (error) {
            console.error("Error assigning lecturer:", error);
        }
    };

    const handleRemoveLecturer = async (lecturerId: number) => {
        if (!selectedCourse) return;

        try {
            await removeLecturer({
                variables: {
                    lecturerId: parseInt(lecturerId.toString()),
                    courseId: parseInt(selectedCourse.id.toString()),
                },
            });
        } catch (error) {
            console.error("Error removing lecturer:", error);
        }
    };

    const openEditModal = (course: Course) => {
        setSelectedCourse(course);
        setFormData({
            courseCode: course.courseCode,
            courseName: course.courseName,
            semester: course.semester,
            description: course.description || "",
            maxTutors: course.maxTutors,
            maxLabAssistants: course.maxLabAssistants,
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (course: Course) => {
        setSelectedCourse(course);
        setShowDeleteModal(true);
    };

    const openAssignModal = (course: Course) => {
        setSelectedCourse(course);
        setShowAssignModal(true);
    };

    return (
        <div className={styles.coursesManagement}>
            <div className={styles.managementContainer}>
                {/* Header */}
                <div className={styles.headerSection}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>Course Management</h1>
                        <p className={styles.subtitle}>
                            Manage courses and lecturer assignments
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className={styles.createButton}
                    >
                        <PlusIcon className={styles.createButtonIcon} />
                        <span>Add Course</span>
                    </button>
                </div>

                {/* Search */}
                <div className={styles.searchSection}>
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                {/* Courses Grid */}
                <div className={styles.coursesGrid}>
                    {coursesLoading
                        ? [...Array(6)].map((_, i) => (
                              <div key={i} className={styles.courseCard}>
                                  <div className={styles.loadingContainer}>
                                      <div
                                          className={styles.loadingSkeleton}
                                      ></div>
                                      <div
                                          className={styles.loadingSkeleton}
                                      ></div>
                                      <div
                                          className={styles.loadingSkeleton}
                                      ></div>
                                  </div>
                              </div>
                          ))
                        : filteredCourses.map((course: Course) => (
                              <div
                                  key={course.id}
                                  className={styles.courseCard}
                              >
                                  <div className={styles.courseHeader}>
                                      <div className={styles.courseInfo}>
                                          <h3 className={styles.courseCode}>
                                              {course.courseCode}
                                          </h3>
                                          <p className={styles.courseName}>
                                              {course.courseName}
                                          </p>
                                          <p className={styles.courseSemester}>
                                              {course.semester}
                                          </p>
                                      </div>
                                      <div className={styles.courseActions}>
                                          <button
                                              onClick={() =>
                                                  openAssignModal(course)
                                              }
                                              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                                              title="Assign Lecturer"
                                          >
                                              <UserPlusIcon
                                                  className={styles.actionIcon}
                                              />
                                          </button>
                                          <button
                                              onClick={() =>
                                                  openEditModal(course)
                                              }
                                              className={styles.actionButton}
                                              title="Edit Course"
                                          >
                                              <PencilIcon
                                                  className={styles.actionIcon}
                                              />
                                          </button>
                                          <button
                                              onClick={() =>
                                                  openDeleteModal(course)
                                              }
                                              className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                                              title="Delete Course"
                                          >
                                              <TrashIcon
                                                  className={styles.actionIcon}
                                              />
                                          </button>
                                      </div>
                                  </div>

                                  {course.description && (
                                      <p className={styles.courseDescription}>
                                          {course.description}
                                      </p>
                                  )}

                                  <div className={styles.courseStats}>
                                      <div className={styles.courseStat}>
                                          <h4
                                              className={styles.courseStatValue}
                                          >
                                              {course.maxTutors}
                                          </h4>
                                          <p className={styles.courseStatLabel}>
                                              Max Tutors
                                          </p>
                                      </div>
                                      <div className={styles.courseStat}>
                                          <h4
                                              className={styles.courseStatValue}
                                          >
                                              {course.maxLabAssistants}
                                          </h4>
                                          <p className={styles.courseStatLabel}>
                                              Max Lab Assistants
                                          </p>
                                      </div>
                                      <div className={styles.courseStat}>
                                          <h4
                                              className={styles.courseStatValue}
                                          >
                                              {course.applications?.length || 0}
                                          </h4>
                                          <p className={styles.courseStatLabel}>
                                              Applications
                                          </p>
                                      </div>
                                  </div>

                                  {/* Assigned Lecturers */}
                                  <div className={styles.courseAssignments}>
                                      <div className={styles.assignmentsHeader}>
                                          <h4
                                              className={
                                                  styles.assignmentsTitle
                                              }
                                          >
                                              Assigned Lecturers (
                                              {course.courseAssignments
                                                  ?.length || 0}
                                              )
                                          </h4>
                                          <button
                                              onClick={() =>
                                                  openAssignModal(course)
                                              }
                                              className={styles.assignButton}
                                          >
                                              Assign
                                          </button>
                                      </div>
                                      {course.courseAssignments?.length > 0 ? (
                                          <div
                                              className={styles.assignmentsList}
                                          >
                                              {course.courseAssignments.map(
                                                  (assignment) => (
                                                      <div
                                                          key={assignment.id}
                                                          className={
                                                              styles.assignmentItem
                                                          }
                                                      >
                                                          <span
                                                              className={
                                                                  styles.lecturerName
                                                              }
                                                          >
                                                              {
                                                                  assignment
                                                                      .lecturer
                                                                      .firstName
                                                              }{" "}
                                                              {
                                                                  assignment
                                                                      .lecturer
                                                                      .lastName
                                                              }
                                                          </span>
                                                          <button
                                                              onClick={() =>
                                                                  handleRemoveLecturer(
                                                                      assignment
                                                                          .lecturer
                                                                          .id
                                                                  )
                                                              }
                                                              className={
                                                                  styles.removeButton
                                                              }
                                                              title="Remove lecturer"
                                                          >
                                                              <UserMinusIcon
                                                                  className={
                                                                      styles.removeIcon
                                                                  }
                                                              />
                                                          </button>
                                                      </div>
                                                  )
                                              )}
                                          </div>
                                      ) : (
                                          <p
                                              className={
                                                  styles.emptyAssignments
                                              }
                                          >
                                              No lecturers assigned
                                          </p>
                                      )}
                                  </div>
                              </div>
                          ))}
                </div>

                {filteredCourses.length === 0 && !coursesLoading && (
                    <div className={styles.emptyState}>
                        <AcademicCapIcon className={styles.emptyStateIcon} />
                        <h3 className={styles.emptyStateText}>
                            No courses found
                        </h3>
                        <p className={styles.emptyStateText}>
                            {searchTerm
                                ? "Try adjusting your search criteria."
                                : "Get started by creating a new course."}
                        </p>
                    </div>
                )}

                {/* Create Course Modal */}
                {showCreateModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>
                                    Create New Course
                                </h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className={styles.closeButton}
                                >
                                    <XMarkIcon className={styles.closeIcon} />
                                </button>
                            </div>
                            <form
                                onSubmit={handleCreateCourse}
                                className={styles.modalForm}
                            >
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Course Code
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.courseCode}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                courseCode: e.target.value,
                                            })
                                        }
                                        className={styles.formInput}
                                        placeholder="e.g., CS101"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Course Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.courseName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                courseName: e.target.value,
                                            })
                                        }
                                        className={styles.formInput}
                                        placeholder="e.g., Introduction to Computer Science"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Semester
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.semester}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                semester: e.target.value,
                                            })
                                        }
                                        className={styles.formInput}
                                        placeholder="e.g., 2024 Semester 1"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                        className={styles.formTextarea}
                                        rows={3}
                                        placeholder="Course description..."
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Max Tutors
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.maxTutors}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    maxTutors: Number(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className={styles.formInput}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            Max Lab Assistants
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.maxLabAssistants}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    maxLabAssistants: Number(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className={styles.formInput}
                                        />
                                    </div>
                                </div>
                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCreateModal(false)
                                        }
                                        className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
                                    >
                                        Create Course
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Course Modal */}
                {showEditModal && selectedCourse && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Edit Course
                                </h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <form
                                onSubmit={handleUpdateCourse}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Course Code
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.courseCode}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                courseCode: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Course Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.courseName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                courseName: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Semester
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.semester}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                semester: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Max Tutors
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.maxTutors}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    maxTutors: Number(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Max Lab Assistants
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.maxLabAssistants}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    maxLabAssistants: Number(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Update Course
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedCourse && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3 text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                                    Delete Course
                                </h3>
                                <div className="mt-2 px-7 py-3">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to delete{" "}
                                        <strong>
                                            {selectedCourse.courseCode} -{" "}
                                            {selectedCourse.courseName}
                                        </strong>
                                        ? This will also remove all related
                                        applications and assignments. This
                                        action cannot be undone.
                                    </p>
                                </div>
                                <div className="flex justify-center space-x-4 mt-4">
                                    <button
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteCourse}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Lecturer Modal */}
                {showAssignModal && selectedCourse && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Assign Lecturer to{" "}
                                    {selectedCourse.courseCode}
                                </h3>
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {lecturers.length > 0 ? (
                                    lecturers.map((lecturer: Lecturer) => (
                                        <div
                                            key={lecturer.id}
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {lecturer.firstName}{" "}
                                                    {lecturer.lastName}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {lecturer.email}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    handleAssignLecturer(
                                                        lecturer.id
                                                    )
                                                }
                                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                            >
                                                Assign
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                                            No available lecturers
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            All lecturers are already assigned
                                            to courses.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
