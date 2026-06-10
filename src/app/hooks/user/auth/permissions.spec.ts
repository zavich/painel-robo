import { hasUserPermission } from "./permissions";

describe("hasUserPermission", () => {
  it("retorna true quando a permissao existe", () => {
    expect(
      hasUserPermission(
        { permissions: ["mass_edit", "change_stage"] } as any,
        "mass_edit",
      ),
    ).toBe(true);
  });

  it("retorna false para usuario sem permissoes", () => {
    expect(hasUserPermission(undefined, "mass_edit")).toBe(false);
    expect(hasUserPermission({ permissions: [] } as any, "mass_edit")).toBe(
      false,
    );
  });
});
