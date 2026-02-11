import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PersonaSwitcher } from "./PersonaSwitcher";

describe("dashboard components", () => {
  it("switches persona deterministically", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PersonaSwitcher value="exec" onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "security" }));
    expect(onChange).toHaveBeenCalledWith("security");
  });
});
