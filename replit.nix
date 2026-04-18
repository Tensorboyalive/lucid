{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.typescript
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.yt-dlp
    pkgs.ffmpeg
  ];
}
