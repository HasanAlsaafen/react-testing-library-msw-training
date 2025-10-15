import React from "react";
import { render } from "@testing-library/react";
import { setupServer } from "msw/node";
import SignUp from "./";
import { handlers } from "./handlers";
import { debug } from "jest-preview";
import { rest } from "msw";
import { screen, waitFor } from "@testing-library/react";
// Setting up the mock server
const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("SignUp Component", () => {
  describe("Validation", () => {
    it("should display validation errors for invalid email", async () => {
      render(<SignUp />);

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, "invalid-email");
      emailInput.blur();
      expect(
        await screen.findByText(/invalid email address/i)
      ).toBeInTheDocument();
      debug();
    });

    it("should display validation errors for short password", async () => {
      render(<SignUp />);

      const passwordInput = screen.getByLabelText(/password/i);
      await userEvent.type(passwordInput, "short");
      passwordInput.blur();
      expect(
        await screen.findByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });

    it("should display success message on successful sign-up", async () => {
      render(<SignUp />);
      await userEvent.type(screen.getByLabelText(/user name/i), "Hasan");
      await userEvent.type(
        screen.getByLabelText(/email address/i),
        "hasan@gmail.com"
      );
      await userEvent.type(screen.getByLabelText(/password/i), "strongoonee");
      const button = screen.getByRole("button", { name: /sign up/i });
      await waitFor(() => expect(button).toBeEnabled());
      await userEvent.click(button);

      expect(
        await screen.findByText(/sign up successfully!/i)
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.queryByLabelText(/email address/i)
        ).not.toBeInTheDocument();
      });
    });

    it("should display error message on sign-up failure", async () => {
      server.use(
        rest.post(/\/signup$/i, async (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ message: "Internal Server Error" })
          );
        })
      );
      render(<SignUp />);
      await userEvent.type(screen.getByLabelText(/user name/i), "Hasan");
      await userEvent.type(
        screen.getByLabelText(/email address/i),
        "hasan@gmail.com"
      );
      await userEvent.type(screen.getByLabelText(/password/i), "strongoonee");

      const button = screen.getByRole("button", { name: /sign up/i });
      await waitFor(() => expect(button).toBeEnabled());

      await userEvent.click(button);

      expect(await screen.findByText(/error signing up!/i)).toBeInTheDocument();
    });
  });
});

describe("Form Interaction", () => {
  it("should enable Sign Up button when form is valid", async () => {
    render(<SignUp />);
    const button = screen.getByRole("button", { name: /sign up/i });
    expect(button).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/user name/i), "Hasan");
    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "hasan@gmail.com"
    );
    await userEvent.type(screen.getByLabelText(/password/i), "strongoonee");

    await waitFor(() => expect(button).toBeEnabled());
  });
});

it("should disable Sign Up button when form is invalid", async () => {
  render(<SignUp />);
  const button = screen.getByRole("button", { name: /sign up/i });
  expect(button).toBeDisabled();

  await userEvent.type(screen.getByLabelText(/user name/i), "Hasan");
  await userEvent.type(
    screen.getByLabelText(/email address/i),
    "hasan@gmail.com"
  );
  await userEvent.type(screen.getByLabelText(/password/i), "short");

  await waitFor(() => expect(button).toBeDisabled());
});

it("should update form fields on user input", async () => {
  render(<SignUp />);
  const username = screen.getByLabelText(/user name/i);
  const email = screen.getByLabelText(/email address/i);
  const password = screen.getByLabelText(/password/i);

  await userEvent.type(username, "Ali");
  await userEvent.type(email, "Hasan@gmail.com");
  await userEvent.type(password, "Strongoonee");

  expect(username).toHaveValue("Ali");
  expect(email).toHaveValue("Hasan@gmail.com");
  expect(password).toHaveValue("Strongoonee");
});

it("should redirect user to home page after successful signup", async () => {
  render(<SignUp />);

  await userEvent.type(screen.getByLabelText(/user name/i), "Hasan");
  await userEvent.type(
    screen.getByLabelText(/email address/i),
    "hasan@gmail.com"
  );
  await userEvent.type(screen.getByLabelText(/password/i), "Strongoonee");

  const button = screen.getByRole("button", { name: /sign up/i });
  await waitFor(() => expect(button).toBeEnabled());

  await userEvent.click(button);

  await waitFor(() => {
    expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
  });
  it("should show loading state when submitting the form", async () => {
    server.use(
      rest.post(/\/signup$/i, async (req, res, ctx) => {
        return res(
          ctx.delay(1000),
          ctx.status(201),
          ctx.json({ message: "ok" })
        );
      })
    );

    render(<SignUp />);

    await userEvent.type(screen.getByLabelText(/user name/i), "Hasan");
    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "hasan@gmail.com"
    );
    await userEvent.type(screen.getByLabelText(/password/i), "Strongoonee");

    const button = screen.getByRole("button", { name: /sign up/i });
    await waitFor(() => expect(button).toBeEnabled());

    await userEvent.click(button);

    expect(button).toHaveAttribute("disabled");
  });
  it("should close snackbar after showing success message", async () => {
    render(<SignUp />);

    await userEvent.type(screen.getByLabelText(/user name/i), "Hasan");
    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "hasan@gmail.com"
    );
    await userEvent.type(screen.getByLabelText(/password/i), "Strongoonee");

    const button = screen.getByRole("button", { name: /sign up/i });
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);

    const snackbarText = await screen.findByText(/sign up successfully/i);
    expect(snackbarText).toBeInTheDocument();
  });
  it("should reset form fields after successful signup", async () => {
    render(<SignUp />);

    const username = screen.getByLabelText(/user name/i);
    const email = screen.getByLabelText(/email address/i);
    const password = screen.getByLabelText(/password/i);

    await userEvent.type(username, "Hasan");
    await userEvent.type(email, "hasan@gmail.com");
    await userEvent.type(password, "Strongoonee");

    const button = screen.getByRole("button", { name: /sign up/i });
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);

    await waitFor(() => {
      expect(username).toHaveValue("");
      expect(email).toHaveValue("");
      expect(password).toHaveValue("");
    });
  });

  it("should display error message on sign-up failure", async () => {
    server.use(
      rest.post("/signup", (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({ message: "Email already registered" })
        );
      })
    );

    render(<SignUp />);

    await userEvent.type(screen.getByLabelText(/user name/i), "Hasan");
    await userEvent.type(
      screen.getByLabelText(/email address/i),
      "hasan@gmail.com"
    );
    await userEvent.type(screen.getByLabelText(/password/i), "Strongoonee");

    const button = screen.getByRole("button", { name: /sign up/i });
    await userEvent.click(button);

    expect(await screen.findByText(/error signing up/i)).toBeInTheDocument();
  });
});
