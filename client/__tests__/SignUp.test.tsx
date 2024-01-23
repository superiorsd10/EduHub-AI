import { fireEvent, render, screen, waitFor } from "../testing-utils";
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

  it("should wait for sign-up process to be completed before calling router.push('/')", async () => {
    // Arrange: Mock the signUpWithGoogle to simulate an in-progress sign-in
    mockSignInWithGoogle.mockImplementationOnce(async () => {
      user = { uid: "123" };
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Act: Render the SignUp component and attempt to sign in with Google
    render(<SignUp />);
    const googleSignInButton = screen.getByRole("button", {
      name: /Sign up with Google/i,
    });
    googleSignInButton.click();

    // Assert: Verify that router.push has not been called yet
    expect(mockPush).not.toHaveBeenCalled();

    // Wait for the sign-in process to be completed
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
  });

  it("should not call router.push('/') before a successful Google OAuth sign-up", async () => {
    // Arrange: Mock the signInWithGoogle to simulate an in-progress sign-in
    mockSignInWithGoogle.mockImplementationOnce(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Act: Render the SignIn component and attempt to sign in with Google
    render(<SignUp />);
    const googleSignInButton = screen.getByRole("button", {
      name: /Sign up with Google/i,
    });
    googleSignInButton.click();

    // Assert: Verify that router.push has not been called yet
    expect(mockPush).not.toHaveBeenCalled();
  });
});
