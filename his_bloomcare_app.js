const STORAGE_KEYS = {
  patients: 'bloomcare_patients',
  vitals: 'bloomcare_vitals',
  iv: 'bloomcare_iv',
  meds: 'bloomcare_meds',
  orders: 'bloomcare_orders',
  labs: 'bloomcare_labs',
  io: 'bloomcare_io',
  appointments: 'bloomcare_appointments',
  notes: 'bloomcare_notes',
  currentUser: 'bloomcare_current_user'
};

const plannedModules = [
  { title: 'Patient Registration', desc: 'Creates the patient master list and stores demographic profile details for hospital use.' },
  { title: 'Electronic Patient Chart', desc: 'Displays the patient demographic profile and connects all clinical sheets in one record.' },
  { title: 'Vital Signs Monitoring', desc: 'Allows nurses and physicians to document blood pressure, temperature, pulse, respiration, and oxygen saturation.' },
  { title: 'IV Therapy Monitoring', desc: 'Tracks IV solution, rate, site, status, and ordering physician.' },
  { title: 'Medication Administration', desc: 'Stores drug name, dose, route, frequency, and who administered the medication.' },
  { title: 'Doctor\'s Orders', desc: 'Records physician instructions with priority and implementation status.' },
  { title: 'Laboratory Monitoring', desc: 'Stores laboratory requests, results, and result status for quick viewing.' },
  { title: 'Intake and Output', desc: 'Tracks fluid balance by comparing intake and output per entry.' },
  { title: 'Appointment Scheduling', desc: 'Keeps consultation or follow-up schedules for patients.' },
  { title: 'Nurse\'s Notes', desc: 'Provides a simple narrative note sheet for the assigned healthcare team.' }
];

const featureList = [
  { title: 'Role-Based Login', desc: 'Separate login access for patient, doctor, and nurse.' },
  { title: 'Patient Demographic Encoding', desc: 'Patients can encode or review their own demographic profile.' },
  { title: 'Staff Record Encoding', desc: 'Doctors and nurses can encode and update all clinical sheets required in the task.' },
  { title: 'Patient Record Filter', desc: 'Staff can switch between patient records using the patient selector at the top.' },
  { title: 'Local Storage Save', desc: 'Data is saved in the browser so demo records remain after refresh on the same device.' },
  { title: 'Sample Data Loader', desc: 'Loads complete sample records to simulate an actual hospital information system.' },
  { title: 'Girly Dashboard Design', desc: 'Soft pink and lavender interface for a cute but professional hospital template.' },
  { title: 'Patient-Limited View', desc: 'Patients can only access their demographic profile, matching your access rule.' }
];

const demoAccounts = {
  patient: [{ username: 'patient1', password: '1234', patientId: 'P1001', name: 'Ariana Cruz', avatar: '👩🏻' }],
  doctor: [{ username: 'doctor1', password: '1234', name: 'Dr. Sofia Lim', avatar: '👩🏻‍⚕️' }],
  nurse: [{ username: 'nurse1', password: '1234', name: 'Nurse Bea Santos', avatar: '👩🏼‍⚕️' }]
};

let patients = load(STORAGE_KEYS.patients, []);
let vitals = load(STORAGE_KEYS.vitals, []);
let ivEntries = load(STORAGE_KEYS.iv, []);
let medications = load(STORAGE_KEYS.meds, []);
let orders = load(STORAGE_KEYS.orders, []);
let laboratories = load(STORAGE_KEYS.labs, []);
let ioEntries = load(STORAGE_KEYS.io, []);
let appointments = load(STORAGE_KEYS.appointments, []);
let notes = load(STORAGE_KEYS.notes, []);
let currentUser = load(STORAGE_KEYS.currentUser, null);
let activePatientId = '';

const loginScreen = document.getElementById('loginScreen');
const appShell = document.getElementById('appShell');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const navButtons = () => document.querySelectorAll('.nav-btn');
const sections = () => document.querySelectorAll('.section');
const globalSearch = document.getElementById('globalSearch');
const recordPatientFilter = document.getElementById('recordPatientFilter');

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveAll() {
  localStorage.setItem(STORAGE_KEYS.patients, JSON.stringify(patients));
  localStorage.setItem(STORAGE_KEYS.vitals, JSON.stringify(vitals));
  localStorage.setItem(STORAGE_KEYS.iv, JSON.stringify(ivEntries));
  localStorage.setItem(STORAGE_KEYS.meds, JSON.stringify(medications));
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
  localStorage.setItem(STORAGE_KEYS.labs, JSON.stringify(laboratories));
  localStorage.setItem(STORAGE_KEYS.io, JSON.stringify(ioEntries));
  localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
}

function generateId(prefix) {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function normalize(value) {
  return String(value || '').toLowerCase();
}

function isStaff() {
  return currentUser && (currentUser.role === 'doctor' || currentUser.role === 'nurse');
}

function getPatientById(id) {
  return patients.find(item => item.id === id);
}

function getSelectedPatient() {
  if (currentUser?.role === 'patient') return getPatientById(currentUser.patientId);
  return getPatientById(activePatientId);
}

function filterByPatient(list) {
  const patient = getSelectedPatient();
  if (!patient) return [];
  return list.filter(item => item.patientId === patient.id);
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  return isNaN(date.getTime()) ? value : date.toLocaleString();
}

function renderModuleCards() {
  document.getElementById('plannedModules').innerHTML = plannedModules.map(item => `
    <div class="module-item">
      <h4>${item.title}</h4>
      <p>${item.desc}</p>
    </div>
  `).join('');

  document.getElementById('featureList').innerHTML = featureList.map(item => `
    <div class="module-item">
      <h4>${item.title}</h4>
      <p>${item.desc}</p>
    </div>
  `).join('');
}

function renderPatientFilter() {
  if (!isStaff()) return;
  recordPatientFilter.innerHTML = '<option value="">Select patient record</option>' + patients.map(patient => `
    <option value="${patient.id}">${patient.id} - ${patient.fullName}</option>
  `).join('');

  if (!activePatientId && patients.length) activePatientId = patients[0].id;
  recordPatientFilter.value = activePatientId || '';
}

function applyRoleUI() {
  const patientRole = currentUser?.role === 'patient';
  document.querySelectorAll('.role-staff, .staff-only').forEach(node => {
    node.classList.toggle('hidden-by-role', patientRole);
  });

  document.getElementById('currentUserName').textContent = currentUser?.name || 'Guest';
  document.getElementById('currentUserRole').textContent = currentUser ? currentUser.role.toUpperCase() : '';
  document.getElementById('userAvatar').textContent = currentUser?.avatar || '👩🏻';
  document.getElementById('subtitleText').textContent = patientRole
    ? 'Patient portal view: demographic profile only'
    : 'Hospital electronic record and charting workspace';

  globalSearch.placeholder = patientRole ? 'Search profile details...' : 'Search current section...';
}

function showSection(sectionId) {
  sections().forEach(section => section.classList.remove('active'));
  navButtons().forEach(btn => btn.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  const activeBtn = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    document.getElementById('pageTitle').textContent = activeBtn.textContent;
  }
  renderAll(globalSearch.value.trim().toLowerCase());
}

function renderDashboard() {
  document.getElementById('totalPatients').textContent = patients.length;
  document.getElementById('totalVitals').textContent = vitals.length;
  document.getElementById('totalMeds').textContent = medications.length;
  document.getElementById('totalLabs').textContent = laboratories.length;
}

function renderRegistration(filter = '') {
  const body = document.getElementById('registrationTable');
  const filtered = patients.filter(patient =>
    normalize(patient.fullName).includes(filter) ||
    normalize(patient.id).includes(filter) ||
    normalize(patient.ward).includes(filter) ||
    normalize(patient.diagnosis).includes(filter)
  );

  body.innerHTML = filtered.length ? filtered.map(patient => `
    <tr>
      <td>${patient.id}</td>
      <td>${patient.fullName}</td>
      <td>${patient.age}</td>
      <td>${patient.sex}</td>
      <td>${patient.contact}</td>
      <td>${patient.ward}</td>
      <td>
        <div class="action-row">
          <button class="action-btn edit-btn" onclick="openPatientModal('${patient.id}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteRecord('patient','${patient.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="7" class="empty-state">No patient records found.</td></tr>`;
}

function renderProfile(filter = '') {
  const holder = document.getElementById('patientProfileCard');
  const patient = getSelectedPatient();
  if (!patient) {
    holder.innerHTML = '<div class="empty-state">No patient selected yet.</div>';
    return;
  }

  const fields = [
    ['Patient ID', patient.id],
    ['Full Name', patient.fullName],
    ['Age', patient.age],
    ['Sex', patient.sex],
    ['Birthdate', patient.birthdate],
    ['Contact Number', patient.contact],
    ['Address', patient.address],
    ['Civil Status', patient.civilStatus],
    ['Nationality', patient.nationality],
    ['Religion', patient.religion],
    ['Ward / Room', patient.ward],
    ['Admitting Diagnosis', patient.diagnosis],
    ['Emergency Contact', patient.emergencyContact]
  ].filter(item => normalize(item[0]).includes(filter) || normalize(item[1]).includes(filter));

  holder.innerHTML = `
    <div class="profile-header">
      <div class="avatar-photo">🩺</div>
      <div>
        <h2>${patient.fullName}</h2>
        <p>${patient.diagnosis}</p>
        <span class="badge">${currentUser?.role === 'patient' ? 'Patient view only' : 'Staff chart access enabled'}</span>
      </div>
    </div>
    <div class="profile-grid">
      ${fields.map(([label, value]) => `<div><strong>${label}</strong><span>${value}</span></div>`).join('')}
    </div>
  `;
}

function genericTableRenderer({ source, tbodyId, mapRow, filter }) {
  const body = document.getElementById(tbodyId);
  const filtered = filterByPatient(source).filter(item => JSON.stringify(item).toLowerCase().includes(filter));
  body.innerHTML = filtered.length ? filtered.map(mapRow).join('') : `<tr><td colspan="8" class="empty-state">No entries found for this patient.</td></tr>`;
}

function renderVitals(filter = '') {
  genericTableRenderer({
    source: vitals,
    tbodyId: 'vitalsTable',
    filter,
    mapRow: item => `
      <tr>
        <td>${formatDateTime(item.dateTime)}</td><td>${item.bp}</td><td>${item.temp}</td><td>${item.pulse}</td><td>${item.resp}</td><td>${item.o2}</td><td>${item.by}</td>
        <td><div class="action-row"><button class="action-btn delete-btn" onclick="deleteRecord('vital','${item.id}')">Delete</button></div></td>
      </tr>`
  });
}

function renderIV(filter = '') {
  genericTableRenderer({
    source: ivEntries,
    tbodyId: 'ivTable',
    filter,
    mapRow: item => `
      <tr>
        <td>${formatDateTime(item.dateTime)}</td><td>${item.solution}</td><td>${item.rate}</td><td>${item.site}</td><td><span class="status ${normalize(item.status)}">${item.status}</span></td><td>${item.orderedBy}</td>
        <td><div class="action-row"><button class="action-btn delete-btn" onclick="deleteRecord('iv','${item.id}')">Delete</button></div></td>
      </tr>`
  });
}

function renderMedications(filter = '') {
  genericTableRenderer({
    source: medications,
    tbodyId: 'medicationsTable',
    filter,
    mapRow: item => `
      <tr>
        <td>${formatDateTime(item.dateTime)}</td><td>${item.name}</td><td>${item.dose}</td><td>${item.route}</td><td>${item.frequency}</td><td>${item.by}</td>
        <td><div class="action-row"><button class="action-btn delete-btn" onclick="deleteRecord('med','${item.id}')">Delete</button></div></td>
      </tr>`
  });
}

function renderOrders(filter = '') {
  genericTableRenderer({
    source: orders,
    tbodyId: 'ordersTable',
    filter,
    mapRow: item => `
      <tr>
        <td>${formatDateTime(item.dateTime)}</td><td>${item.orderText}</td><td><span class="status ${normalize(item.priority)}">${item.priority}</span></td><td>${item.physician}</td><td><span class="status ${normalize(item.status)}">${item.status}</span></td>
        <td><div class="action-row"><button class="action-btn delete-btn" onclick="deleteRecord('order','${item.id}')">Delete</button></div></td>
      </tr>`
  });
}

function renderLaboratory(filter = '') {
  genericTableRenderer({
    source: laboratories,
    tbodyId: 'laboratoryTable',
    filter,
    mapRow: item => `
      <tr>
        <td>${formatDateTime(item.dateTime)}</td><td>${item.test}</td><td>${item.result}</td><td>${item.reference}</td><td><span class="status ${normalize(item.status)}">${item.status}</span></td>
        <td><div class="action-row"><button class="action-btn delete-btn" onclick="deleteRecord('lab','${item.id}')">Delete</button></div></td>
      </tr>`
  });
}

function renderIO(filter = '') {
  genericTableRenderer({
    source: ioEntries,
    tbodyId: 'ioTable',
    filter,
    mapRow: item => `
      <tr>
        <td>${formatDateTime(item.dateTime)}</td><td>${item.intake} mL</td><td>${item.output} mL</td><td>${item.balance} mL</td><td>${item.remarks}</td><td>${item.by}</td>
        <td><div class="action-row"><button class="action-btn delete-btn" onclick="deleteRecord('io','${item.id}')">Delete</button></div></td>
      </tr>`
  });
}

function renderAppointments(filter = '') {
  const body = document.getElementById('appointmentsTable');
  const filtered = filterByPatient(appointments).filter(item => JSON.stringify(item).toLowerCase().includes(filter));
  body.innerHTML = filtered.length ? filtered.map(item => `
    <tr>
      <td>${item.date}</td><td>${item.time}</td><td>${getPatientById(item.patientId)?.fullName || '-'}</td><td>${item.physician}</td><td><span class="status ${normalize(item.status)}">${item.status}</span></td>
      <td><div class="action-row"><button class="action-btn delete-btn" onclick="deleteRecord('appointment','${item.id}')">Delete</button></div></td>
    </tr>`).join('') : `<tr><td colspan="6" class="empty-state">No appointments found.</td></tr>`;
}

function renderNotes(filter = '') {
  const holder = document.getElementById('notesList');
  const filtered = filterByPatient(notes).filter(item => JSON.stringify(item).toLowerCase().includes(filter));
  holder.innerHTML = filtered.length ? filtered.map(item => `
    <div class="list-item">
      <strong>${formatDateTime(item.dateTime)} - ${item.author}</strong>
      <p>${item.text}</p>
      <div class="action-row" style="margin-top:10px;"><button class="action-btn delete-btn" onclick="deleteRecord('note','${item.id}')">Delete</button></div>
    </div>`).join('') : `<div class="empty-state">No nurse's notes found.</div>`;
}

function renderAll(filter = '') {
  renderModuleCards();
  renderDashboard();
  renderPatientFilter();
  renderProfile(filter);
  if (isStaff()) {
    renderRegistration(filter);
    renderVitals(filter);
    renderIV(filter);
    renderMedications(filter);
    renderOrders(filter);
    renderLaboratory(filter);
    renderIO(filter);
    renderAppointments(filter);
    renderNotes(filter);
  }
}

function openPatientModal(editId = null) {
  if (!isStaff()) return;
  const form = document.getElementById('patientForm');
  form.reset();
  document.getElementById('patientId').value = '';
  document.getElementById('patientModalTitle').textContent = editId ? 'Edit Patient' : 'Add Patient';

  if (editId) {
    const patient = getPatientById(editId);
    if (!patient) return;
    document.getElementById('patientId').value = patient.id;
    document.getElementById('patientFullName').value = patient.fullName;
    document.getElementById('patientAge').value = patient.age;
    document.getElementById('patientSex').value = patient.sex;
    document.getElementById('patientBirthdate').value = patient.birthdate;
    document.getElementById('patientContact').value = patient.contact;
    document.getElementById('patientAddress').value = patient.address;
    document.getElementById('patientCivilStatus').value = patient.civilStatus;
    document.getElementById('patientNationality').value = patient.nationality;
    document.getElementById('patientReligion').value = patient.religion;
    document.getElementById('patientWard').value = patient.ward;
    document.getElementById('patientDiagnosis').value = patient.diagnosis;
    document.getElementById('patientEmergencyContact').value = patient.emergencyContact;
  }

  openModal('patientModal');
}
window.openPatientModal = openPatientModal;

function openModal(id) {
  document.getElementById(id).classList.add('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}
window.onclick = function (event) {
  document.querySelectorAll('.modal').forEach(modal => {
    if (event.target === modal) modal.classList.remove('show');
  });
};

function deleteRecord(type, id) {
  if (!confirm('Delete this record?')) return;
  const config = {
    patient: () => patients = patients.filter(item => item.id !== id),
    vital: () => vitals = vitals.filter(item => item.id !== id),
    iv: () => ivEntries = ivEntries.filter(item => item.id !== id),
    med: () => medications = medications.filter(item => item.id !== id),
    order: () => orders = orders.filter(item => item.id !== id),
    lab: () => laboratories = laboratories.filter(item => item.id !== id),
    io: () => ioEntries = ioEntries.filter(item => item.id !== id),
    appointment: () => appointments = appointments.filter(item => item.id !== id),
    note: () => notes = notes.filter(item => item.id !== id)
  };
  config[type]?.();
  saveAll();
  renderAll(globalSearch.value.trim().toLowerCase());
}
window.deleteRecord = deleteRecord;

function requireSelectedPatient() {
  const patient = getSelectedPatient();
  if (!patient) {
    alert('Please select a patient record first.');
    return null;
  }
  return patient;
}

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const role = document.getElementById('loginRole').value;
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const account = (demoAccounts[role] || []).find(item => item.username === username && item.password === password);

  if (!account) {
    loginMessage.textContent = 'Invalid login credentials. Please use one of the demo accounts.';
    return;
  }

  currentUser = { ...account, role };
  loginMessage.textContent = '';
  if (role === 'patient' && !patients.find(item => item.id === account.patientId)) {
    loadSampleData(false);
  }
  saveAll();
  initAppView();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  appShell.classList.add('hidden');
  loginScreen.classList.remove('hidden');
});

document.getElementById('loadSampleBtn').addEventListener('click', () => loadSampleData(true));
document.getElementById('addPatientBtn').addEventListener('click', () => openPatientModal());
recordPatientFilter.addEventListener('change', e => {
  activePatientId = e.target.value;
  renderAll(globalSearch.value.trim().toLowerCase());
});
globalSearch.addEventListener('input', e => renderAll(e.target.value.trim().toLowerCase()));

document.querySelectorAll('[data-modal-open]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!requireSelectedPatient()) return;
    openModal(btn.dataset.modalOpen);
  });
});
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
navButtons().forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.section)));

function attachSimpleForm(formId, builder) {
  document.getElementById(formId).addEventListener('submit', e => {
    e.preventDefault();
    const patient = requireSelectedPatient();
    if (!patient) return;
    builder(patient);
    saveAll();
    closeModal(e.target.closest('.modal')?.id || '');
    e.target.reset();
    renderAll(globalSearch.value.trim().toLowerCase());
  });
}

document.getElementById('patientForm').addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('patientId').value || generateId('P');
  const payload = {
    id,
    fullName: document.getElementById('patientFullName').value,
    age: document.getElementById('patientAge').value,
    sex: document.getElementById('patientSex').value,
    birthdate: document.getElementById('patientBirthdate').value,
    contact: document.getElementById('patientContact').value,
    address: document.getElementById('patientAddress').value,
    civilStatus: document.getElementById('patientCivilStatus').value,
    nationality: document.getElementById('patientNationality').value,
    religion: document.getElementById('patientReligion').value,
    ward: document.getElementById('patientWard').value,
    diagnosis: document.getElementById('patientDiagnosis').value,
    emergencyContact: document.getElementById('patientEmergencyContact').value
  };

  const existingIndex = patients.findIndex(item => item.id === id);
  if (existingIndex >= 0) patients[existingIndex] = payload;
  else patients.push(payload);

  if (!activePatientId) activePatientId = id;
  saveAll();
  closeModal('patientModal');
  e.target.reset();
  renderAll(globalSearch.value.trim().toLowerCase());
});

attachSimpleForm('vitalsForm', patient => {
  vitals.push({
    id: generateId('V'), patientId: patient.id,
    dateTime: document.getElementById('vitalDateTime').value,
    bp: document.getElementById('vitalBp').value,
    temp: document.getElementById('vitalTemp').value,
    pulse: document.getElementById('vitalPulse').value,
    resp: document.getElementById('vitalResp').value,
    o2: document.getElementById('vitalO2').value,
    by: currentUser.name
  });
});

attachSimpleForm('ivForm', patient => {
  ivEntries.push({
    id: generateId('IV'), patientId: patient.id,
    dateTime: document.getElementById('ivDateTime').value,
    solution: document.getElementById('ivSolution').value,
    rate: document.getElementById('ivRate').value,
    site: document.getElementById('ivSite').value,
    status: document.getElementById('ivStatus').value,
    orderedBy: document.getElementById('ivOrderedBy').value
  });
});

attachSimpleForm('medicationForm', patient => {
  medications.push({
    id: generateId('MED'), patientId: patient.id,
    dateTime: document.getElementById('medDateTime').value,
    name: document.getElementById('medName').value,
    dose: document.getElementById('medDose').value,
    route: document.getElementById('medRoute').value,
    frequency: document.getElementById('medFrequency').value,
    by: document.getElementById('medBy').value
  });
});

attachSimpleForm('ordersForm', patient => {
  orders.push({
    id: generateId('ORD'), patientId: patient.id,
    dateTime: document.getElementById('orderDateTime').value,
    orderText: document.getElementById('orderText').value,
    priority: document.getElementById('orderPriority').value,
    physician: document.getElementById('orderPhysician').value,
    status: document.getElementById('orderStatus').value
  });
});

attachSimpleForm('laboratoryForm', patient => {
  laboratories.push({
    id: generateId('LAB'), patientId: patient.id,
    dateTime: document.getElementById('labDateTime').value,
    test: document.getElementById('labTest').value,
    result: document.getElementById('labResult').value,
    reference: document.getElementById('labReference').value,
    status: document.getElementById('labStatus').value
  });
});

attachSimpleForm('ioForm', patient => {
  const intake = Number(document.getElementById('ioIntake').value);
  const output = Number(document.getElementById('ioOutput').value);
  ioEntries.push({
    id: generateId('IO'), patientId: patient.id,
    dateTime: document.getElementById('ioDateTime').value,
    intake,
    output,
    balance: intake - output,
    remarks: document.getElementById('ioRemarks').value,
    by: document.getElementById('ioBy').value
  });
});

attachSimpleForm('appointmentForm', patient => {
  appointments.push({
    id: generateId('APT'), patientId: patient.id,
    date: document.getElementById('appointmentDate').value,
    time: document.getElementById('appointmentTime').value,
    physician: document.getElementById('appointmentPhysician').value,
    status: document.getElementById('appointmentStatus').value
  });
});

attachSimpleForm('notesForm', patient => {
  notes.push({
    id: generateId('NOTE'), patientId: patient.id,
    dateTime: document.getElementById('noteDateTime').value,
    author: document.getElementById('noteAuthor').value,
    text: document.getElementById('noteText').value
  });
});

function loadSampleData(showAlert = true) {
  patients = [
    {
      id: 'P1001', fullName: 'Ariana Cruz', age: 21, sex: 'Female', birthdate: '2004-06-18',
      contact: '09171234567', address: 'Malolos, Bulacan', civilStatus: 'Single', nationality: 'Filipino', religion: 'Catholic',
      ward: 'Ward 3 - Room 12', diagnosis: 'Acute Gastroenteritis', emergencyContact: 'Liza Cruz - 09179998888'
    },
    {
      id: 'P1002', fullName: 'Bea Santos', age: 24, sex: 'Female', birthdate: '2001-02-11',
      contact: '09179876543', address: 'Meycauayan, Bulacan', civilStatus: 'Single', nationality: 'Filipino', religion: 'Christian',
      ward: 'Ward 2 - Room 08', diagnosis: 'Bronchial Asthma', emergencyContact: 'Mark Santos - 09174445555'
    }
  ];

  vitals = [
    { id: 'V1001', patientId: 'P1001', dateTime: '2026-04-12T08:00', bp: '110/70', temp: '37.2°C', pulse: '82', resp: '18', o2: '98%', by: 'Nurse Bea Santos' },
    { id: 'V1002', patientId: 'P1002', dateTime: '2026-04-12T09:15', bp: '120/80', temp: '36.8°C', pulse: '79', resp: '20', o2: '97%', by: 'Nurse Bea Santos' }
  ];

  ivEntries = [
    { id: 'IV1001', patientId: 'P1001', dateTime: '2026-04-12T08:30', solution: 'D5LR 1L', rate: '30 gtts/min', site: 'Left Hand', status: 'Infusing', orderedBy: 'Dr. Sofia Lim' }
  ];

  medications = [
    { id: 'MED1001', patientId: 'P1001', dateTime: '2026-04-12T10:00', name: 'Paracetamol', dose: '500 mg', route: 'PO', frequency: 'q6h', by: 'Nurse Bea Santos' },
    { id: 'MED1002', patientId: 'P1002', dateTime: '2026-04-12T10:30', name: 'Salbutamol Nebule', dose: '1 neb', route: 'Inhalation', frequency: 'q8h', by: 'Nurse Bea Santos' }
  ];

  orders = [
    { id: 'ORD1001', patientId: 'P1001', dateTime: '2026-04-12T07:45', orderText: 'Start IV hydration and monitor stool frequency', priority: 'Routine', physician: 'Dr. Sofia Lim', status: 'Active' }
  ];

  laboratories = [
    { id: 'LAB1001', patientId: 'P1001', dateTime: '2026-04-12T09:00', test: 'CBC', result: 'WBC 9.1', reference: '4.5 - 11.0', status: 'Released' },
    { id: 'LAB1002', patientId: 'P1002', dateTime: '2026-04-12T09:20', test: 'Chest X-Ray', result: 'Pending reading', reference: 'N/A', status: 'Requested' }
  ];

  ioEntries = [
    { id: 'IO1001', patientId: 'P1001', dateTime: '2026-04-12T12:00', intake: 1200, output: 800, balance: 400, remarks: 'Improving oral intake', by: 'Nurse Bea Santos' }
  ];

  appointments = [
    { id: 'APT1001', patientId: 'P1001', date: '2026-04-15', time: '09:00', physician: 'Dr. Sofia Lim', status: 'Scheduled' },
    { id: 'APT1002', patientId: 'P1002', date: '2026-04-16', time: '13:00', physician: 'Dr. Sofia Lim', status: 'Scheduled' }
  ];

  notes = [
    { id: 'NOTE1001', patientId: 'P1001', dateTime: '2026-04-12T11:00', author: 'Nurse Bea Santos', text: 'Patient tolerated oral fluids well and no further vomiting noted during shift.' }
  ];

  if (!activePatientId && patients.length) activePatientId = patients[0].id;
  saveAll();
  renderAll(globalSearch.value.trim().toLowerCase());
  if (showAlert) alert('Sample HIS data loaded successfully.');
}

function initAppView() {
  loginScreen.classList.add('hidden');
  appShell.classList.remove('hidden');
  applyRoleUI();
  renderPatientFilter();

  if (currentUser?.role === 'patient') {
    activePatientId = currentUser.patientId;
    showSection('demographics');
  } else {
    if (!patients.length) loadSampleData(false);
    if (!activePatientId && patients.length) activePatientId = patients[0].id;
    showSection('dashboard');
  }

  renderAll();
}

if (currentUser) {
  initAppView();
}
