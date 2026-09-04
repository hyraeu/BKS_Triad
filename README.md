# Authentication Page - React Solution

A complete authentication interface built with React, featuring Login and Signup views with comprehensive form validation and a polished UI.

## 🚀 Features

- **Dual Mode Interface**: Toggle between Login and Signup views
- **Form Validation**: Real-time validation with user-friendly error messages
- **Password Management**: Show/hide toggle, strength indicator (stretch goal)
- **Mock Authentication**: Simulated login/signup with user persistence
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: ARIA labels, focus management, and semantic HTML

## 📦 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd auth-page-solution
```

2. Install dependencies:

```bash
npm install
3. Start the development server:
```

```bash
npm run dev
```

4. Open your browser and navigate to http://localhost:5173

## 🛠️ Tech Stack

- **React 18**: UI Framework
- **Vite**: Build Tool and development server
- **TailWind CSS**: Utility-first CSS Framework
- **Lucide React**: Icon Library
- **React Hooks**: State Management

## 📁 Project Structure

```text
src/
├── components/
│ ├── AuthPage.jsx          # Main authentication component
│ ├── Field.jsx             # Reusable form field component
│ └── PasswordStrength.jsx  # Password strength indicator
├── contexts/
│ └── AuthContext.jsx       # Authentication context provider
├── hooks/
│ └── useAuth.js            # Custom auth hook
├── App.jsx                 # Root component
├── main.jsx                # Entry point
└── index.css               # Global styles
```

## 🔐 Usage

Login

- **Enter your email and password**
- **Use the mock credentials: test@example.com / Password123!**
- **Or sign up for a new account**

Signup

- **Fill in name, email, password, and confirm password**
- **Password must be at least 8 characters**
- **Password strength indicator provides real-time feedback**
- **Passwords must match**

Validation Rules

- **All fields are required**
- **Email must be in valid format (e.g., user@domain.com)**
- **Password minimum 8 characters (signup only)**
- **Password and confirm password must match (signup only)**

## 🎯 Stretch Goals Implemented

1. ✅ Persist login state using React Context - User session is saved in localStorage
2. ✅ Password strength indicator - Visual feedback with weak/medium/strong labels
3. ✅ Mock authentication - Hardcoded user database with credential checking
4. ✅ Accessibility pass - ARIA attributes, focus states, error announcements

## 📸 Screenshots

Login view

Signup View with Validation Errors

Password Strength Indicator

Successful Submission

## 🧪 Testing

To test the mock authentication

Existing Users

- **Email: test@example.com**
- **Password: Password123!**
- **Email: jamie@marginal.com**
- **Password: SecurePass456!**

Signup

- **Create a new account with any email not already in the system**
- **Password must meet the minimum requirements**

## 📝 Activity Requirements Checklist

- **☑**
  LoginForm and SignupForm in single component with toggle
- **☑**
  Controlled inputs using useState
- **☑**
  onSubmit handler with e.preventDefault()
- **☑**
  Form data logging/display
- **☑**
  Required field validation
- **☑**
  Email format validation
- **☑**
  Password length validation (min 8 characters)
- **☑**
  Confirm password validation
- **☑**
  Field-specific error messages
- **☑**
  Show/hide password toggle
- **☑**
  Loading state on submit button
- **☑**
  Responsive Layout
