export const throwInvalidPasswords = ({
  password,
  passwordConfirmation,
}: {
  password?: string;
  passwordConfirmation?: string;
}) => {
  const minLen = 6;

  const pleaseEnterPassword = 'Please enter a password';

  const passwordLength = 'Password must be at least 8 characters';

  const passwordMustContainNumber = 'Password must contain at least one number';

  const pleaseConfirmYourPassword = 'Please confirm your password';

  const passwordMismatch = 'Passwords do not match!';

  if (!password) {
    throw new Error(pleaseEnterPassword);
  }

  // Some rules.... Lets say greater than or eqal 10 characters, with 1 number, and one upercase
  if (password.length < minLen) {
    throw new Error(passwordLength);
  }

  const hasNumber = /\d/;
  if (!hasNumber.test(password)) {
    throw new Error(passwordMustContainNumber);
  }

  if (!passwordConfirmation) {
    throw new Error(pleaseConfirmYourPassword);
  }

  if (password !== passwordConfirmation) {
    throw new Error(passwordMismatch);
  }

  return;
};
