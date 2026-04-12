import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

test("renders the company home page", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  expect(
    screen.getByRole("heading", {
      name: /strong, secure, and stylish fencing/i,
    })
  ).toBeInTheDocument();
});
