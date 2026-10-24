import { describe, expect, it } from "vitest";
import React from "react";
import ControlPlanePage, { metadata } from "./page";

describe("ControlPlanePage", () => {
  it("exports valid metadata for SEO", () => {
    expect(metadata.title).toContain("Control Plane");
    expect(metadata.description).toBeDefined();
  });

  it("renders without throwing and produces a valid React element tree", () => {
    const element = ControlPlanePage();
    expect(element).toBeDefined();
    expect(element.type).toBe("main");
  });
});
