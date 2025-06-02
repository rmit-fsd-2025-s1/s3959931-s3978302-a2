// filepath: c:\s3978302\Full Stack Development\s3959931-s3978302-a2\my-teaching-app\src\modules\auth\__tests__\utils\userAccounts.spec.ts
import {
  initializeUserAccounts,
  getUserByCredentials,
  getUserById,
  updateUserProfile,
  userAccounts,
  UserAccount,
} from "@/modules/auth/utils/userAccounts";
import { validateRoleSpecificEmail } from "@/modules/auth/utils/authValidation.utils";

describe("User Accounts Utilities", () => {
  // Setup mock localStorage
  const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => {
        return store[key] || null;
      },
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      clear: () => {
        store = {};
      },
    };
  })();

  // Set up mocks before each test
  beforeEach(() => {
    // Clear the mock localStorage
    mockLocalStorage.clear();

    // Mock the window.localStorage
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
    });

    // Spy on localStorage methods
    jest.spyOn(window.localStorage, "getItem");
    jest.spyOn(window.localStorage, "setItem");
  });

  // Test 1: Initialize user accounts adds users to localStorage
  test("initializeUserAccounts adds user accounts to localStorage when not present", () => {
    // Set up initial condition - no users in localStorage
    expect(window.localStorage.getItem("users")).toBeNull();

    // Call the function
    initializeUserAccounts();

    // Check if localStorage was updated
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "users",
      expect.any(String)
    );

    // Parse the stored data and check its structure
    const storedUsers = JSON.parse(
      window.localStorage.getItem("users") || "[]"
    );
    expect(storedUsers).toEqual(userAccounts);
    expect(storedUsers.length).toBeGreaterThan(0);
  });

  // Test 2: Initialize user accounts doesn't overwrite existing data
  test("initializeUserAccounts does not overwrite existing user accounts", () => {
    // Set up initial condition - users already in localStorage
    const mockUsers = [
      {
        id: "test1",
        email: "test@example.com",
        role: "tutor" as const,
        password: "password",
        fullName: "Test User",
      },
    ];
    window.localStorage.setItem("users", JSON.stringify(mockUsers));

    // Call the function
    initializeUserAccounts();

    // Check that localStorage was not modified
    const storedUsers = JSON.parse(
      window.localStorage.getItem("users") || "[]"
    );
    expect(storedUsers).toEqual(mockUsers);
    expect(storedUsers).not.toEqual(userAccounts);
  });

  // Test 3: Get user by credentials returns the correct user
  test("getUserByCredentials returns correct user with valid credentials", () => {
    // Setup test data
    const testUser: UserAccount = {
      id: "test1",
      email: "test@example.com",
      password: "password123",
      role: "tutor",
      fullName: "Test User",
    };

    window.localStorage.setItem("users", JSON.stringify([testUser]));

    // Call the function with correct credentials
    const result = getUserByCredentials("test@example.com", "password123");

    // Check the result
    expect(result).toEqual(testUser);
  });

  // Test 4: Get user by credentials returns undefined with invalid credentials
  test("getUserByCredentials returns undefined with invalid credentials", () => {
    // Setup test data
    const testUser: UserAccount = {
      id: "test1",
      email: "test@example.com",
      password: "password123",
      role: "tutor",
      fullName: "Test User",
    };

    window.localStorage.setItem("users", JSON.stringify([testUser]));

    // Call the function with incorrect credentials
    const result1 = getUserByCredentials("test@example.com", "wrongpassword");
    const result2 = getUserByCredentials("wrong@example.com", "password123");

    // Check the result
    expect(result1).toBeUndefined();
    expect(result2).toBeUndefined();
  });

  // Test 5: Get user by ID returns the correct user
  test("getUserById returns correct user with valid ID", () => {
    // Setup test data
    const testUser: UserAccount = {
      id: "test1",
      email: "test@example.com",
      password: "password123",
      role: "tutor",
      fullName: "Test User",
    };

    window.localStorage.setItem("users", JSON.stringify([testUser]));

    // Call the function
    const result = getUserById("test1");

    // Check the result
    expect(result).toEqual(testUser);
  });

  // Test 6: Update user profile updates the correct fields
  test("updateUserProfile updates user information correctly", () => {
    // Setup test data
    const testUser: UserAccount = {
      id: "test1",
      email: "test@example.com",
      password: "password123",
      role: "tutor",
      fullName: "Test User",
    };

    window.localStorage.setItem("users", JSON.stringify([testUser]));

    // Call the function with updates
    const updatedUser = updateUserProfile("test1", {
      fullName: "Updated Name",
      bio: "New bio",
      skills: ["JavaScript", "React"],
    });

    // Check the result
    expect(updatedUser).toBeDefined();
    expect(updatedUser?.fullName).toBe("Updated Name");
    expect(updatedUser?.bio).toBe("New bio");
    expect(updatedUser?.skills).toEqual(["JavaScript", "React"]);

    // Check that protected fields aren't changed
    expect(updatedUser?.email).toBe("test@example.com");
    expect(updatedUser?.password).toBe("password123");
    expect(updatedUser?.role).toBe("tutor");

    // Check that localStorage was updated
    const storedUsers = JSON.parse(
      window.localStorage.getItem("users") || "[]"
    );
    expect(storedUsers[0]).toEqual(updatedUser);
  });

  // Test 7: Validate role-specific email validates emails correctly
  test("validateRoleSpecificEmail validates email formats correctly", () => {
    // Test tutor emails
    expect(validateRoleSpecificEmail("valid@candidate.edu.au", "tutor")).toBe(
      true
    );
    expect(validateRoleSpecificEmail("invalid@gmail.com", "tutor")).toBe(false);
    expect(validateRoleSpecificEmail("test@CANDIDATE.EDU.AU", "tutor")).toBe(
      true
    ); // Case insensitive

    // Test lecturer emails
    expect(validateRoleSpecificEmail("valid@lecturer.edu.au", "lecturer")).toBe(
      true
    );
    expect(validateRoleSpecificEmail("invalid@gmail.com", "lecturer")).toBe(
      false
    );
    expect(validateRoleSpecificEmail("test@LECTURER.EDU.AU", "lecturer")).toBe(
      true
    ); // Case insensitive
  });
});
