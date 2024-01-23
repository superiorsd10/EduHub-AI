import { act, fireEvent, render, screen, waitFor } from "../testing-utils";
import SignUp from "@/pages/signup";

// Mock Firebase auth
jest.mock("@/firebase/clientApp", () => ({
  auth: {
    /* ...mock auth object... */
  },
}));

// Mock react-firebase-hooks/auth
jest.mock("react-firebase-hooks/auth", () => ({
  useSignInWithGoogle: jest.fn(() => [
    mockSignInWithGoogle,
    user,
    loading,
    error,
  ]),
  useCreateUserWithEmailAndPassword: jest.fn(() => [
    mockCreateUserWithEmailAndPassword,
    user,
    loading,
    error,
  ]),
}));

// Mock useRouter
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
    // ...other router methods and properties
  }),
}));

// Mock for signInWithEmailAndPassword and signInWithGoogle
const mockSignInWithGoogle = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();

// Mock user, loading, error as per your requirements
let user = {
  /* ...user data... */
};

const loading = false;
const error = null;

const mockPush = jest.fn();

describe("Sign Up Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    user = {
      /* ...user data... */
    };
  });

  it("should wait for signUpWithGoogle process to be completed before redirecting", async () => {
    // Arrange: Mock the signUpWithGoogle to simulate an in-progress sign-in
    mockSignInWithGoogle.mockImplementationOnce(async () => {
      user = { uid: "123" };
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Act: Render the SignUp component and attempt to sign in with Google
    render(<SignUp />);

    const googleSignInButton = screen.getByRole("button", {
      name: "Sign up with Google",
    });
    fireEvent.click(googleSignInButton);

    // Assert: Verify that router.push has not been called yet
    expect(mockPush).not.toHaveBeenCalled();

    // Wait for the sign-in process to be completed
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("should not redirect before a successful signInWithGoogle", async () => {
    // Arrange: Mock the signInWithGoogle to simulate an in-progress sign-in
    mockCreateUserWithEmailAndPassword.mockImplementationOnce(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Act: Render the SignIn component and attempt to sign in with Google
    render(<SignUp />);

    const googleSignInButton = screen.getByRole("button", {
      name: "Sign up with Google",
    });
    fireEvent.click(googleSignInButton);

    // Assert: Verify that router.push has not been called yet
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should wait for createUserWithEmailAndPassword process to be completed before redirecting", async () => {
    // Arrange: Mock the createUserWithEmailAndPassword to simulate an in-progress sign-up
    mockCreateUserWithEmailAndPassword.mockImplementationOnce(async () => {
      user = { uid: "123" };
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Act: Render the SignUp component and simulate user input and form submission
    render(<SignUp />);

    // Fill out the form fields with valid data
    const nameInput = screen.getByPlaceholderText("Name");
    const emailInput = screen.getByPlaceholderText("Your email");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const customSignUpButton = screen.getByRole("button", { name: /Sign Up/ });

    // Simulate user typing into the input fields
    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
    fireEvent.change(emailInput, { target: { value: "jane@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Simulate form submission
    fireEvent.click(customSignUpButton);

    // Assert: Verify that router.push has not been called yet
    expect(mockPush).not.toHaveBeenCalled();

    // Wait for the sign-up process to be completed
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("should not redirect before a successful signUpWithEmailAndPassword", async () => {
    // Arrange: Mock the signUpWithEmailAndPassword to simulate an in-progress sign-up
    mockCreateUserWithEmailAndPassword.mockImplementationOnce(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Act: Render the SignUp component and attempt to sign up with Google
    render(<SignUp />);

    const customSignUpbutton = screen.getByRole("button", {
      name: "Sign Up",
    });

    fireEvent.click(customSignUpbutton);

    // Assert: Verify that router.push has not been called yet
    expect(mockPush).not.toHaveBeenCalled();
  });
});
