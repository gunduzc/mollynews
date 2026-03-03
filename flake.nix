{
  description = "SlashNews (Next.js + TypeScript + SQLite) development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      forAllSystems = nixpkgs.lib.genAttrs [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
    in
    {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.nodejs_20
              pkgs.python3
              pkgs.pkg-config
              pkgs.gnumake
              pkgs.gcc
              pkgs.sqlite
              pkgs.sqlite.dev
            ];

            shellHook = ''
              echo "SlashNews dev shell: node $(node --version)"
              echo "Tip: npm install && npm run dev"
            '';
          };
        });
    };
}
