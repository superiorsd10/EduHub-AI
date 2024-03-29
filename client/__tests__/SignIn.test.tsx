import { act, fireEvent, render, screen, waitFor } from "../testing-utils";
import SignIn from "@/pages/signin";

// Mock Firebase auth
jest.mock("@/firebase/clientApp", () => ({
  auth: {
    /* ...mock auth object... */
  },
}));

// Mock react-firebase-hooks/auth
jest.mock("react-firebase-hooks/auth", () => ({
  useSignInWithEmailAndPassword: jest.fn(() => [
    mockSignInWithEmailAndPassword,
    user,
    loading,
    error,
  ]),
  useSignInWithGoogle: jest.fn(() => [
    mockSignInWithGoogle,
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
const mockSignInWithEmailAndPassword = jest.fn();
const mockSignInWithGoogle = jest.fn();

// Mock user, loading, error as per your requirements
let user = {
  /* ...user data... */
};

const loading = false;
const error = null;

const mockPush = jest.fn();

describe("Sign In Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    user = {
      /* ...user data... */
    };
  });

  it("should wait for signInWithGoogle to be completed before redirecting", async () => {
    // Arrange: Mock the signInWithGoogle to simulate an in-progress sign-in
    mockSignInWithGoogle.mockImplementationOnce(async () => {
      user = { uid: "123" };
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Act: Render the SignIn component and attempt to sign in with Google
    render(<SignIn />);
    const googleSignInButton = screen.getByRole("button", {
      name: "Sign in with Google",
    });

    fireEvent.click(googleSignInButton);

    // Assert: Verify that router.push has not been called yet
    expect(mockPush).not.toHaveBeenCalled();

    // Wait for the sign-in process to be completed
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("should not redirect before a successful signInWithGoogle", async () => {
    // Arrange: Mock the signInWithGoogle to simulate an in-progress sign-in
    mockSignInWithGoogle.mockImplementationOnce(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Act: Render the SignIn component and attempt to sign in with Google
    render(<SignIn />);
    const googleSignInButton = screen.getByRole("button", {
      name: "Sign in with Google",
    });

    fireEvent.click(googleSignInButton);

    // Assert: Verify that router.push has not been called yet
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should wait for signInWithEmailAndPassword process to be completed before redirecting", async () => {
    // Arrange: Mock the signInWithEmailAndPassword to simulate an in-progress sign-in
    mockSignInWithEmailAndPassword.mockImplementationOnce(async () => {
      user = { uid: "123" };
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Act: Render the SignUp component and attempt to sign in with Google
    render(<SignIn />);
    const customSignInButton = screen.getByRole("button", {
      name: "Sign In",
    });
    fireEvent.click(customSignInButton);

    // Assert: Verify that router.push has not been called yet
    expect(mockPush).not.toHaveBeenCalled();

    // Wait for the sign-in process to be completed
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("should not redirect before a successful signInWithEmailAndPassword", async () => {
    // Arrange: Mock the signInWithEmailAndPassword to simulate an in-progress sign-in
    mockSignInWithEmailAndPassword.mockImplementationOnce(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Act: Render the SignIn component and attempt to sign in with Google
    render(<SignIn />);
    const customSignInButton = screen.getByRole("button", {
      name: "Sign In",
    });
    fireEvent.click(customSignInButton);

    // Assert: Verify that router.push has not been called yet
    expect(mockPush).not.toHaveBeenCalled();
  });
});
