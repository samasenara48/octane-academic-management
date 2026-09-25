const API_BASE = '';

let currentUser = null;
let teachers = [];
let subjects = [];
let grades = [];
let students = [];


// =====================================================
// API HELPER
// =====================================================

async function apiRequest(url, options = {}) {

  const token = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(API_BASE + url, {
    ...options,
    headers
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401) {

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    window.location.href = '/';

    return null;
  }

  if (!response.ok) {

    let message = 'Something went wrong';

    if (data?.message) {
      message = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message;
    }

    throw new Error(message);
  }

  return data;
}


// =====================================================
// LOGIN
// =====================================================

const loginForm = document.getElementById('loginForm');

if (loginForm) {

  loginForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    const email =
      document.getElementById('email').value.trim();

    const password =
      document.getElementById('password').value;

    const message =
      document.getElementById('loginMessage');

    message.textContent = '';

    try {

      const response = await fetch('/auth/login', {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          email,
          password
        })

      });

      const data = await response.json();

      if (!response.ok) {

        message.textContent =
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || 'Invalid email or password';

        message.className =
          'login-message error';

        return;
      }


      /*
       * Support both possible response formats
       */

      const accessToken =
        data.accessToken ||
        data.access_token ||
        data.token;

      const refreshToken =
        data.refreshToken ||
        data.refresh_token;


      if (!accessToken) {

        message.textContent =
          'Login succeeded but no access token was returned.';

        message.className =
          'login-message error';

        console.error('Login response:', data);

        return;
      }


      localStorage.setItem(
        'accessToken',
        accessToken
      );


      if (refreshToken) {

        localStorage.setItem(
          'refreshToken',
          refreshToken
        );

      }


      window.location.href =
        '/dashboard.html';

    } catch (error) {

      console.error(error);

      message.textContent =
        'Unable to connect to the server.';

      message.className =
        'login-message error';

    }

  });

}


// =====================================================
// DASHBOARD INITIALIZATION
// =====================================================

async function initializeDashboard() {

  const dashboard =
    document.getElementById('dashboardSection');

  if (!dashboard) {
    return;
  }


  const token =
    localStorage.getItem('accessToken');


  if (!token) {

    window.location.href = '/';

    return;
  }


  try {

    currentUser =
      await apiRequest('/auth/me');


    displayCurrentUser();


    await Promise.all([
      loadStudents(),
      loadTeachers(),
      loadGrades(),
      loadSubjects()
    ]);


    updateStatistics();

    populateGradeSelects();
    populateTeacherSelect();


  } catch (error) {

    console.error(
      'Dashboard initialization error:',
      error
    );

  }

}


// =====================================================
// CURRENT USER
// =====================================================

function displayCurrentUser() {

  if (!currentUser) {
    return;
  }


  const name =
    currentUser.fullName ||
    currentUser.name ||
    currentUser.user?.fullName ||
    'User';


  const role =
    currentUser.role ||
    currentUser.user?.role ||
    'User';


  const nameElement =
    document.getElementById('currentUserName');

  const roleElement =
    document.getElementById('currentUserRole');


  if (nameElement) {
    nameElement.textContent = name;
  }


  if (roleElement) {
    roleElement.textContent =
      role.toUpperCase();
  }


  /*
   * Only admin should see Add buttons.
   */

  const isAdmin =
    role.toLowerCase() === 'admin';


  document
    .querySelectorAll(
      '#teacherFormContainer, #subjectFormContainer'
    )
    .forEach(element => {

      if (!isAdmin) {
        element.style.display = 'none';
      }

    });

}


// =====================================================
// NAVIGATION
// =====================================================

function showSection(sectionId, button) {

  document
    .querySelectorAll('.content-section')
    .forEach(section => {

      section.classList.remove('active');

    });


  const section =
    document.getElementById(sectionId);


  if (section) {

    section.classList.add('active');

  }


  document
    .querySelectorAll('.sidebar-menu button')
    .forEach(btn => {

      btn.classList.remove('active');

    });


  if (button) {

    button.classList.add('active');

  }


  const titles = {

    dashboardSection: 'Dashboard',

    studentsSection: 'Students',

    teachersSection: 'Teachers',

    gradesSection: 'Grades',

    subjectsSection: 'Subjects',

    enrollmentsSection: 'Enrollments'

  };


  const title =
    document.getElementById('pageTitle');


  if (title) {

    title.textContent =
      titles[sectionId] || 'Dashboard';

  }


  /*
   * Load data when section opens.
   */

  if (sectionId === 'studentsSection') {
    showStudents();
  }

  if (sectionId === 'teachersSection') {
    showTeachers();
  }

  if (sectionId === 'gradesSection') {
    showGrades();
  }

  if (sectionId === 'subjectsSection') {
    showSubjects();
  }

  if (sectionId === 'enrollmentsSection') {
    showEnrollments();
  }

}


// =====================================================
// STUDENTS
// =====================================================

async function loadStudents() {

  try {

    const data =
      await apiRequest('/students');

    students =
      Array.isArray(data)
        ? data
        : data?.data || [];

    renderStudents();

  } catch (error) {

    console.error(
      'Students error:',
      error
    );

    renderError(
      'studentsTableBody',
      error.message
    );

  }

}


async function showStudents() {

  await loadStudents();

}


function renderStudents() {

  const body =
    document.getElementById(
      'studentsTableBody'
    );


  if (!body) {
    return;
  }


  if (!students.length) {

    body.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <h3>No students found</h3>
            <p>No students are registered yet.</p>
          </div>
        </td>
      </tr>
    `;

    return;
  }


  body.innerHTML =
    students.map(student => {

      const grade =
        student.grade?.name ||
        student.grade?.number ||
        student.gradeId ||
        '-';


      return `
        <tr>

          <td>${student.id ?? '-'}</td>

          <td>
            ${escapeHtml(
              student.fullName ||
              student.name ||
              '-'
            )}
          </td>

          <td>
            ${escapeHtml(
              student.email ||
              student.user?.email ||
              '-'
            )}
          </td>

          <td>
            ${escapeHtml(
              student.phone ||
              student.user?.phone ||
              '-'
            )}
          </td>

          <td>
            ${escapeHtml(String(grade))}
          </td>

          <td>
            ${escapeHtml(
              student.academicYear ||
              student.academic_year ||
              '-'
            )}
          </td>

        </tr>
      `;

    }).join('');

}


// =====================================================
// TEACHERS
// =====================================================

async function loadTeachers() {

  try {

    const data =
      await apiRequest('/teachers');

    teachers =
      Array.isArray(data)
        ? data
        : data?.data || [];

    renderTeachers();

  } catch (error) {

    console.error(
      'Teachers error:',
      error
    );

    renderError(
      'teachersTableBody',
      error.message
    );

  }

}


async function showTeachers() {

  await loadTeachers();

}


function renderTeachers() {

  const body =
    document.getElementById(
      'teachersTableBody'
    );


  if (!body) {
    return;
  }


  if (!teachers.length) {

    body.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <h3>No teachers found</h3>
            <p>Add a teacher to get started.</p>
          </div>
        </td>
      </tr>
    `;

    return;
  }


  body.innerHTML =
    teachers.map(teacher => {

      const user =
        teacher.user || {};


      const name =
        user.fullName ||
        teacher.fullName ||
        '-';


      const email =
        user.email ||
        teacher.email ||
        '-';


      const phone =
        user.phone ||
        teacher.phone ||
        '-';


      const subjectCount =
        teacher.subjects?.length || 0;


      return `
        <tr>

          <td>${teacher.id ?? '-'}</td>

          <td>
            ${escapeHtml(name)}
          </td>

          <td>
            ${escapeHtml(email)}
          </td>

          <td>
            ${escapeHtml(phone)}
          </td>

          <td>
            ${subjectCount}
          </td>

          <td>

            <div class="table-actions">

              <button
                class="btn btn-secondary"
                onclick="viewTeacherSubjects(${teacher.id})">
                Subjects
              </button>

              ${
                isAdmin()
                  ? `
                    <button
                      class="btn btn-danger"
                      onclick="deleteTeacher(${teacher.id})">
                      Delete
                    </button>
                  `
                  : ''
              }

            </div>

          </td>

        </tr>
      `;

    }).join('');

}


// =====================================================
// TEACHER FORM
// =====================================================

function showTeacherForm() {

  if (!isAdmin()) {

    alert(
      'Only administrators can add teachers.'
    );

    return;
  }


  const form =
    document.getElementById(
      'teacherFormContainer'
    );


  if (form) {

    form.style.display = 'block';

    form.scrollIntoView({
      behavior: 'smooth'
    });

  }

}


function cancelTeacherForm() {

  const form =
    document.getElementById(
      'teacherFormContainer'
    );


  if (form) {

    form.style.display = 'none';

  }


  const teacherForm =
    document.getElementById(
      'teacherForm'
    );


  if (teacherForm) {

    teacherForm.reset();

  }

}


const teacherForm =
  document.getElementById(
    'teacherForm'
  );


if (teacherForm) {

  teacherForm.addEventListener(
    'submit',
    async event => {

      event.preventDefault();


      try {

        await apiRequest(
          '/teachers',
          {
            method: 'POST',

            body: JSON.stringify({

              fullName:
                document.getElementById(
                  'teacherFullName'
                ).value.trim(),

              email:
                document.getElementById(
                  'teacherEmail'
                ).value.trim(),

              phone:
                document.getElementById(
                  'teacherPhone'
                ).value.trim() || undefined

            })

          }
        );


        alert(
          'Teacher added successfully.'
        );


        cancelTeacherForm();

        await loadTeachers();

        updateStatistics();

        populateTeacherSelect();


      } catch (error) {

        alert(error.message);

      }

    }
  );

}


// =====================================================
// DELETE TEACHER
// =====================================================

async function deleteTeacher(id) {

  if (!isAdmin()) {

    alert(
      'Only administrators can delete teachers.'
    );

    return;
  }


  if (
    !confirm(
      'Are you sure you want to delete this teacher?'
    )
  ) {

    return;

  }


  try {

    await apiRequest(
      `/teachers/${id}`,
      {
        method: 'DELETE'
      }
    );


    alert(
      'Teacher deleted successfully.'
    );


    await loadTeachers();

    updateStatistics();

    populateTeacherSelect();


  } catch (error) {

    alert(error.message);

  }

}


// =====================================================
// TEACHER SUBJECTS
// =====================================================

async function viewTeacherSubjects(id) {

  try {

    const data =
      await apiRequest(
        `/teachers/${id}/subjects`
      );


    const items =
      Array.isArray(data)
        ? data
        : data?.data || [];


    if (!items.length) {

      alert(
        'This teacher has no assigned subjects.'
      );

      return;
    }


    const names =
      items.map(subject =>
        subject.name || 'Unknown subject'
      );


    alert(
      'Assigned Subjects:\n\n' +
      names.join('\n')
    );


  } catch (error) {

    alert(error.message);

  }

}


// =====================================================
// GRADES
// =====================================================

async function loadGrades() {

  try {

    const data =
      await apiRequest('/grades');

    grades =
      Array.isArray(data)
        ? data
        : data?.data || [];

    renderGrades();

  } catch (error) {

    console.error(
      'Grades error:',
      error
    );

    renderError(
      'gradesTableBody',
      error.message
    );

  }

}


async function showGrades() {

  await loadGrades();

}


function renderGrades() {

  const body =
    document.getElementById(
      'gradesTableBody'
    );


  if (!body) {
    return;
  }


  if (!grades.length) {

    body.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            <h3>No grades found</h3>
            <p>No academic grades are available.</p>
          </div>
        </td>
      </tr>
    `;

    return;
  }


  body.innerHTML =
    grades.map(grade => {

      return `
        <tr>

          <td>
            ${grade.id ?? '-'}
          </td>

          <td>
            ${escapeHtml(
              grade.name || '-'
            )}
          </td>

          <td>
            ${escapeHtml(
              String(grade.number ?? '-')
            )}
          </td>

          <td>
            ${escapeHtml(
              grade.description || '-'
            )}
          </td>

        </tr>
      `;

    }).join('');

}


// =====================================================
// SUBJECTS
// =====================================================

async function loadSubjects() {

  try {

    const filter =
      document.getElementById(
        'subjectGradeFilter'
      );


    let url = '/subjects';


    if (
      filter &&
      filter.value
    ) {

      url =
        `/subjects?gradeId=${filter.value}`;

    }


    const data =
      await apiRequest(url);


    subjects =
      Array.isArray(data)
        ? data
        : data?.data || [];


    renderSubjects();

  } catch (error) {

    console.error(
      'Subjects error:',
      error
    );

    renderError(
      'subjectsTableBody',
      error.message
    );

  }

}


async function showSubjects() {

  await loadSubjects();

}


function renderSubjects() {

  const body =
    document.getElementById(
      'subjectsTableBody'
    );


  if (!body) {
    return;
  }


  if (!subjects.length) {

    body.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <h3>No subjects found</h3>
            <p>No subjects are available.</p>
          </div>
        </td>
      </tr>
    `;

    return;
  }


  body.innerHTML =
    subjects.map(subject => {

      const grade =
        subject.grade?.name ||
        subject.grade?.number ||
        '-';


      const teacher =
        subject.teacher?.user?.fullName ||
        subject.teacher?.fullName ||
        '-';


      return `
        <tr>

          <td>
            ${subject.id ?? '-'}
          </td>

          <td>
            ${escapeHtml(
              subject.name || '-'
            )}
          </td>

          <td>
            ${escapeHtml(
              subject.description || '-'
            )}
          </td>

          <td>
            ${escapeHtml(
              String(grade)
            )}
          </td>

          <td>
            ${escapeHtml(
              teacher
            )}
          </td>

          <td>

            <div class="table-actions">

              <button
                class="btn btn-secondary"
                onclick="viewSubjectStudents(${subject.id})">
                Students
              </button>

              ${
                isAdmin()
                  ? `
                    <button
                      class="btn btn-danger"
                      onclick="deleteSubject(${subject.id})">
                      Delete
                    </button>
                  `
                  : ''
              }

            </div>

          </td>

        </tr>
      `;

    }).join('');

}


// =====================================================
// SUBJECT FORM
// =====================================================

function showSubjectForm() {

  if (!isAdmin()) {

    alert(
      'Only administrators can add subjects.'
    );

    return;
  }


  populateGradeSelects();
  populateTeacherSelect();


  const form =
    document.getElementById(
      'subjectFormContainer'
    );


  if (form) {

    form.style.display = 'block';

    form.scrollIntoView({
      behavior: 'smooth'
    });

  }

}


function cancelSubjectForm() {

  const form =
    document.getElementById(
      'subjectFormContainer'
    );


  if (form) {

    form.style.display = 'none';

  }


  const subjectForm =
    document.getElementById(
      'subjectForm'
    );


  if (subjectForm) {

    subjectForm.reset();

  }

}


const subjectForm =
  document.getElementById(
    'subjectForm'
  );


if (subjectForm) {

  subjectForm.addEventListener(
    'submit',
    async event => {

      event.preventDefault();


      try {

        await apiRequest(
          '/subjects',
          {
            method: 'POST',

            body: JSON.stringify({

              name:
                document.getElementById(
                  'subjectName'
                ).value.trim(),

              description:
                document.getElementById(
                  'subjectDescription'
                ).value.trim() || undefined,

              gradeId:
                Number(
                  document.getElementById(
                    'subjectGrade'
                  ).value
                ),

              teacherId:
                Number(
                  document.getElementById(
                    'subjectTeacher'
                  ).value
                )

            })

          }
        );


        alert(
          'Subject added successfully.'
        );


        cancelSubjectForm();

        await loadSubjects();

        updateStatistics();


      } catch (error) {

        alert(error.message);

      }

    }
  );

}


// =====================================================
// DELETE SUBJECT
// =====================================================

async function deleteSubject(id) {

  if (!isAdmin()) {

    alert(
      'Only administrators can delete subjects.'
    );

    return;
  }


  if (
    !confirm(
      'Are you sure you want to delete this subject?'
    )
  ) {

    return;

  }


  try {

    await apiRequest(
      `/subjects/${id}`,
      {
        method: 'DELETE'
      }
    );


    alert(
      'Subject deleted successfully.'
    );


    await loadSubjects();

    updateStatistics();


  } catch (error) {

    alert(error.message);

  }

}


// =====================================================
// SUBJECT STUDENTS
// =====================================================

async function viewSubjectStudents(id) {

  try {

    const data =
      await apiRequest(
        `/subjects/${id}/students`
      );


    const items =
      Array.isArray(data)
        ? data
        : data?.data || [];


    if (!items.length) {

      alert(
        'No students are enrolled in this subject.'
      );

      return;
    }


    const names =
      items.map(student =>
        student.fullName ||
        student.name ||
        'Unknown student'
      );


    alert(
      'Enrolled Students:\n\n' +
      names.join('\n')
    );


  } catch (error) {

    alert(error.message);

  }

}


// =====================================================
// SELECTS
// =====================================================

function populateGradeSelects() {

  const createSelect =
    document.getElementById(
      'subjectGrade'
    );


  const filterSelect =
    document.getElementById(
      'subjectGradeFilter'
    );


  const options =
    grades.map(grade => {

      return `
        <option value="${grade.id}">
          ${escapeHtml(
            grade.name ||
            `Grade ${grade.number}`
          )}
        </option>
      `;

    }).join('');


  if (createSelect) {

    createSelect.innerHTML =
      `<option value="">Select Grade</option>` +
      options;

  }


  if (filterSelect) {

    const oldValue =
      filterSelect.value;


    filterSelect.innerHTML =
      `<option value="">All Grades</option>` +
      options;


    filterSelect.value =
      oldValue;

  }

}


function populateTeacherSelect() {

  const select =
    document.getElementById(
      'subjectTeacher'
    );


  if (!select) {
    return;
  }


  select.innerHTML =
    `<option value="">Select Teacher</option>`;


  teachers.forEach(teacher => {

    const user =
      teacher.user || {};


    const name =
      user.fullName ||
      teacher.fullName ||
      `Teacher ${teacher.id}`;


    const option =
      document.createElement(
        'option'
      );


    option.value =
      teacher.id;


    option.textContent =
      name;


    select.appendChild(option);

  });

}


// =====================================================
// ENROLLMENTS
// =====================================================

async function showEnrollments() {

  const section =
    document.getElementById(
      'enrollmentsSection'
    );


  if (!section) {
    return;
  }


  const body =
    section.querySelector(
      '.card-body'
    );


  if (!body) {
    return;
  }


  body.innerHTML = `

    <div class="empty-state">

      <h3>
        Enrollment Management
      </h3>

      <p>
        Students can be enrolled in subjects
        according to their grade and academic year.
      </p>

      <p style="margin-top:10px;">
        Maximum 5 subjects per student per academic year.
      </p>

    </div>

  `;

}


// =====================================================
// STATISTICS
// =====================================================

function updateStatistics() {

  const studentCount =
    document.getElementById(
      'studentCount'
    );


  const teacherCount =
    document.getElementById(
      'teacherCount'
    );


  const gradeCount =
    document.getElementById(
      'gradeCount'
    );


  const subjectCount =
    document.getElementById(
      'subjectCount'
    );


  if (studentCount) {
    studentCount.textContent =
      students.length;
  }


  if (teacherCount) {
    teacherCount.textContent =
      teachers.length;
  }


  if (gradeCount) {
    gradeCount.textContent =
      grades.length;
  }


  if (subjectCount) {
    subjectCount.textContent =
      subjects.length;
  }

}


// =====================================================
// SEARCH
// =====================================================

const teacherSearch =
  document.getElementById(
    'teacherSearch'
  );


if (teacherSearch) {

  teacherSearch.addEventListener(
    'input',
    () => {

      const value =
        teacherSearch.value
          .toLowerCase()
          .trim();


      document
        .querySelectorAll(
          '#teachersTableBody tr'
        )
        .forEach(row => {

          row.style.display =
            row.textContent
              .toLowerCase()
              .includes(value)
                ? ''
                : 'none';

        });

    }
  );

}


const studentSearch =
  document.getElementById(
    'studentSearch'
  );


if (studentSearch) {

  studentSearch.addEventListener(
    'input',
    () => {

      const value =
        studentSearch.value
          .toLowerCase()
          .trim();


      document
        .querySelectorAll(
          '#studentsTableBody tr'
        )
        .forEach(row => {

          row.style.display =
            row.textContent
              .toLowerCase()
              .includes(value)
                ? ''
                : 'none';

        });

    }
  );

}


const subjectGradeFilter =
  document.getElementById(
    'subjectGradeFilter'
  );


if (subjectGradeFilter) {

  subjectGradeFilter.addEventListener(
    'change',
    () => {

      showSubjects();

    }
  );

}


// =====================================================
// LOGOUT
// =====================================================

async function logout() {

  try {

    const token =
      localStorage.getItem(
        'accessToken'
      );


    if (token) {

      await fetch(
        '/auth/logout',
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    }

  } catch (error) {

    console.error(
      'Logout error:',
      error
    );

  }


  localStorage.removeItem(
    'accessToken'
  );

  localStorage.removeItem(
    'refreshToken'
  );


  window.location.href = '/';

}


// =====================================================
// HELPERS
// =====================================================

function isAdmin() {

  const role =
    currentUser?.role ||
    currentUser?.user?.role ||
    '';


  return role.toLowerCase() === 'admin';

}


function escapeHtml(value) {

  if (value === null ||
      value === undefined) {

    return '';

  }


  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

}


function renderError(elementId, message) {

  const body =
    document.getElementById(
      elementId
    );


  if (!body) {
    return;
  }


  body.innerHTML = `

    <tr>

      <td colspan="10">

        <div class="empty-state">

          <h3>
            Unable to load data
          </h3>

          <p>
            ${escapeHtml(message)}
          </p>

        </div>

      </td>

    </tr>

  `;

}


// =====================================================
// START
// =====================================================

window.addEventListener(
  'DOMContentLoaded',
  () => {

    initializeDashboard();

  }
);