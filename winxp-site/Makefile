# Makefile for Windows XP Desktop Recreation

.PHONY: build run dev clean release help

# Default target
help:
	@echo "Windows XP Desktop Recreation - Make targets:"
	@echo ""
	@echo "  build     - Build the project in debug mode"
	@echo "  run       - Build and run the project"
	@echo "  dev       - Run in development mode (with auto-reload)"
	@echo "  release   - Build the project in release mode"
	@echo "  clean     - Clean build artifacts"
	@echo "  help      - Show this help message"

build:
	cargo build

run: build
	cargo run

dev:
	cargo run

release:
	cargo build --release

clean:
	cargo clean

# Platform-specific targets
ifeq ($(OS),Windows_NT)
run-script: run.ps1
	./run.ps1

dev-script: dev.ps1
	./dev.ps1
else
run-script: run.sh
	./run.sh

dev-script: dev.sh
	./dev.sh
endif
