---
title: Начало работы с Rust
category: it/rust
updatedAt: 2025-11-29
---

# Начало работы с Rust

Этот документ фиксирует шаги по установке toolchain, созданию проектов и оформлению best practices.

## Установка

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup default stable
rustup component add clippy rustfmt
```

## Первый проект

```bash
cargo new hello-rust --bin
cd hello-rust
cargo run
```

## Идеи для заметок

- Структура workspace и управление зависимостями в `Cargo.toml`.
- Macros, trait bounds, lifetimes.
- Инструменты: `cargo fmt`, `cargo clippy`, `cargo test`, `cargo watch`.

