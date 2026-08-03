/* ===========================================================
   Unity Hospital - Frontend <-> Backend connector
   Handles: Login, Registration, Appointment booking,
            Doctors list, Contact form
   =========================================================== */

const API_BASE = window.location.origin + '/api';

/* ---------- small helpers ---------- */

function showAlert(container, message, type) {
  if (!container) { alert(message); return; }
  container.style.display = 'block';
  container.className = 'alert alert-' + (type === 'error' ? 'danger' : 'success');
  container.innerHTML = message;
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setLoading(button, isLoading, loadingText) {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = loadingText || 'Please wait...';
    button.disabled = true;
  } else {
    button.innerHTML = button.dataset.originalText || button.innerHTML;
    button.disabled = false;
  }
}

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || 'Something went wrong. Please try again.');
    if (body.needsVerification) err.needsVerification = true;
    if (body.email) err.email = body.email;
    throw err;
  }
  return body;
}

/* ---------- LOGIN ---------- */

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const msgBox = document.getElementById('loginMsg');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = form.userid.value.trim();
    const password = form.usrpsw.value;

    setLoading(submitBtn, true, 'Logging in...');
    try {
      const data = await postJSON(API_BASE + '/auth/login', { email, password });
      localStorage.setItem('unityHospitalUser', JSON.stringify(data.user));
      showAlert(msgBox, 'Login successful! Redirecting...', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } catch (err) {
      if (err.needsVerification) {
        showAlert(msgBox, err.message + ' <a href="registration.html?verify=' + encodeURIComponent(err.email) + '">Verify now</a>', 'error');
      } else {
        showAlert(msgBox, err.message, 'error');
      }
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

/* ---------- REGISTRATION (Step 1: submit details, triggers OTP email) ---------- */

function initRegistrationForm() {
  const form = document.getElementById('regForm');
  if (!form) return;

  const msgBox = document.getElementById('regMsg');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
      showAlert(msgBox, 'Passwords do not match.', 'error');
      return;
    }

    setLoading(submitBtn, true, 'Sending OTP...');
    try {
      const data = await postJSON(API_BASE + '/auth/register', {
        name: firstName + ' ' + lastName,
        email,
        password
      });
      showOtpStep(data.email || email);
    } catch (err) {
      showAlert(msgBox, err.message, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

/* ---------- REGISTRATION (Step 2: verify OTP) ---------- */

function showOtpStep(email) {
  const regForm = document.getElementById('regForm');
  const otpForm = document.getElementById('otpForm');
  const emailDisplay = document.getElementById('otpEmailDisplay');

  if (!otpForm) return;

  if (regForm) regForm.style.display = 'none';
  otpForm.style.display = '';
  otpForm.dataset.email = email;
  if (emailDisplay) emailDisplay.textContent = email;

  const otpInput = otpForm.querySelector('input[name="otp"]');
  if (otpInput) otpInput.focus();
}

function initOtpForm() {
  const form = document.getElementById('otpForm');
  if (!form) return;

  const msgBox = document.getElementById('otpMsg');
  const submitBtn = form.querySelector('button[type="submit"]');
  const resendLink = document.getElementById('resendOtpLink');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = form.dataset.email;
    const otp = form.otp.value.trim();

    setLoading(submitBtn, true, 'Verifying...');
    try {
      const data = await postJSON(API_BASE + '/auth/verify-otp', { email, otp });
      localStorage.setItem('unityHospitalUser', JSON.stringify(data.user));
      showAlert(msgBox, 'Email verified! Logging you in...', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } catch (err) {
      showAlert(msgBox, err.message, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });

  if (resendLink) {
    resendLink.addEventListener('click', async function (e) {
      e.preventDefault();
      const email = form.dataset.email;
      resendLink.textContent = 'Sending...';
      try {
        await postJSON(API_BASE + '/auth/resend-otp', { email });
        showAlert(msgBox, 'A new OTP has been sent to your email.', 'success');
      } catch (err) {
        showAlert(msgBox, err.message, 'error');
      } finally {
        resendLink.textContent = "Didn't get the code? Resend OTP";
      }
    });
  }
}

/* ---------- APPOINTMENT BOOKING ---------- */

function initAppointmentForm() {
  const form = document.getElementById('apptForm');
  if (!form) return;

  const msgBox = document.getElementById('apptMsg');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const payload = {
      patientName: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.number.value.trim(),
      subject: form.subject.value.trim(),
      department: form.department.value,
      date: form.date.value,
      time: form.time.value
    };

    setLoading(submitBtn, true, 'Booking...');
    try {
      await postJSON(API_BASE + '/appointments/book', payload);
      showAlert(msgBox, 'Your appointment has been booked successfully!', 'success');
      form.reset();
    } catch (err) {
      showAlert(msgBox, err.message, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

/* ---------- CONTACT FORM ---------- */

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const msgBox = document.getElementById('contactMsg');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      number: form.number.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim()
    };

    setLoading(submitBtn, true, 'Sending...');
    try {
      await postJSON(API_BASE + '/contact', payload);
      showAlert(msgBox, 'Your message has been sent successfully!', 'success');
      form.reset();
    } catch (err) {
      showAlert(msgBox, err.message, 'error');
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

/* ---------- DOCTORS LIST (loaded live from the database) ---------- */

async function loadDoctors() {
  const grid = document.getElementById('doctorsGrid');
  const select = document.getElementById('deptSelect');

  if (!grid && !select) return;

  try {
    const res = await fetch(API_BASE + '/doctors');
    const doctors = await res.json();

    if (grid && Array.isArray(doctors) && doctors.length) {
      grid.innerHTML = doctors.map(doc => `
        <li class="col-sm-3 col-xs-6" style="margin-bottom: 30px;">
          <div class="team-img">
            <img class="img-responsive" src="${doc.image || 'assets/img/team/1.jpg'}" alt="${doc.name}">
          </div>
          <h3>${doc.name}</h3>
          <h4>/ ${doc.qualification || ''}</h4>
          <p>${doc.specialization}</p>
        </li>
      `).join('');
    }

    if (select && Array.isArray(doctors) && doctors.length) {
      const current = select.innerHTML;
      select.innerHTML = current + doctors.map(doc =>
        `<option value="${doc.name}">${doc.name} (${doc.specialization})</option>`
      ).join('');
    }
  } catch (err) {
    console.error('Could not load doctors from the server:', err.message);
  }
}

/* ---------- NAVBAR: show logged-in user / guest menu, handle logout ---------- */

function getLoggedInUser() {
  const raw = localStorage.getItem('unityHospitalUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function initAuthState() {
  const user = getLoggedInUser();
  const guestLinks = document.querySelectorAll('.js-guest-menu');
  const userLinks = document.querySelectorAll('.js-user-menu');
  const greetings = document.querySelectorAll('.js-user-greeting');

  if (user) {
    guestLinks.forEach(el => { el.style.display = 'none'; });
    userLinks.forEach(el => { el.style.display = ''; });
    greetings.forEach(el => { el.textContent = 'Hi, ' + user.name; });
  } else {
    guestLinks.forEach(el => { el.style.display = ''; });
    userLinks.forEach(el => { el.style.display = 'none'; });
  }
}

function logoutUser() {
  localStorage.removeItem('unityHospitalUser');
  window.location.href = 'index.html';
}

/* ---------- PROFILE PAGE ---------- */

function initProfilePage() {
  const loggedInBox = document.getElementById('profileLoggedIn');
  const loggedOutBox = document.getElementById('profileLoggedOut');
  if (!loggedInBox || !loggedOutBox) return;

  const user = getLoggedInUser();

  if (user) {
    loggedInBox.style.display = '';
    loggedOutBox.style.display = 'none';
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileNameCell').textContent = user.name;
    document.getElementById('profileEmailCell').textContent = user.email;
  } else {
    loggedInBox.style.display = 'none';
    loggedOutBox.style.display = '';
  }
}

function checkVerifyLinkParam() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('verify');
  if (!email) return;

  showOtpStep(email);
  postJSON(API_BASE + '/auth/resend-otp', { email }).catch(() => { /* ignore - user can click resend manually */ });
}

/* ---------- init on page load ---------- */

document.addEventListener('DOMContentLoaded', function () {
  initLoginForm();
  initRegistrationForm();
  initOtpForm();
  initAppointmentForm();
  initContactForm();
  loadDoctors();
  initAuthState();
  initProfilePage();
  checkVerifyLinkParam();
});
