# Contributing to Neuro-Viral Score Engine

Thanks for your interest in contributing! Here's how to get started.

---

## Reporting Bugs

Use the [Bug Report](https://github.com/Tensorboyalive/neuro-viral-engine/issues/new?template=bug_report.md) template. Include:

- Steps to reproduce
- Expected vs actual behavior
- Environment (Python version, GPU/CPU, demo or live mode)
- Error logs or screenshots

## Suggesting Features

Use the [Feature Request](https://github.com/Tensorboyalive/neuro-viral-engine/issues/new?template=feature_request.md) template.

---

## Development Setup

### Engine (Python)

```bash
git clone https://github.com/Tensorboyalive/neuro-viral-engine.git
cd neuro-viral-engine
python3.11 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m engine.run test_video.mp4 --demo   # Verify it works
```

### Brain Video (Remotion)

```bash
cd brain-video
npm install
npm run studio   # Opens preview at localhost:3000
```

---

## Submitting a PR

1. **Fork** the repo and create a branch: `git checkout -b feat/my-feature`
2. **Make changes** — keep commits focused and descriptive
3. **Test locally** — run demo mode to verify nothing breaks
4. **Push** and open a Pull Request against `main`

### PR Checklist

- [ ] Demo mode still works (`python -m engine.run video.mp4 --demo`)
- [ ] No hardcoded secrets or credentials
- [ ] Commit message follows `type: description` format (feat, fix, docs, chore)

---

## Code Style

### Python (engine/)

- Python 3.11+
- Type hints encouraged
- Descriptive function names
- Keep files under 400 lines

### TypeScript (brain-video/)

- Standard Remotion patterns
- All animation via `useCurrentFrame()` + `interpolate()`
- Images via `<Img>` + `staticFile()`, not native `<img>`

---

## Where Contributions Are Most Welcome

| Area | Examples |
|------|---------|
| **Visualization** | New brain render styles, interactive web viewer |
| **Scoring Models** | Additional network mappings, alternative scoring formulas |
| **Documentation** | Tutorials, walkthroughs, translations |
| **Platform Support** | AWS/Azure setup scripts, Docker container |
| **Video Templates** | New Remotion scenes, themes, transitions |

The core `engine/` code and `brain-video/src/` are stable — contributions that extend rather than rewrite are preferred.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
