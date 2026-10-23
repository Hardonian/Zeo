#!/usr/bin/env sh
# Idempotently validates and starts a local OpenAI-compatible Dynamo route.
set -eu

command_name="${1:-start}"
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_root=$(CDPATH= cd -- "$script_dir/.." && pwd)
config_file="$repo_root/config/dynamo_router.yaml"
runtime_dir="$repo_root/.zeo/dynamo"
pid_file="$runtime_dir/router.pid"
log_file="$runtime_dir/router.log"

fail() {
  printf '%s\n' "zeo-dynamo: $*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "missing $1. Install it, then rerun $0 $command_name."
}

ensure_runtime_dir() {
  mkdir -p "$runtime_dir"
  [ -f "$config_file" ] || fail "missing $config_file. Restore the repository configuration before deployment."
}

check_environment() {
  [ -n "${ZEO_DYNAMO_MODEL:-}" ] || fail "ZEO_DYNAMO_MODEL is required. Set it to the local model identifier."
  [ -n "${ZEO_LOCAL_ENGINE_URL:-}" ] || fail "ZEO_LOCAL_ENGINE_URL is required. Set it to the SGLang or vLLM OpenAI-compatible base URL."
  case "$ZEO_LOCAL_ENGINE_URL" in
    http://*|https://*) ;;
    *) fail "ZEO_LOCAL_ENGINE_URL must start with http:// or https://." ;;
  esac
}

router_command() {
  if [ -n "${ZEO_DYNAMO_ROUTER_COMMAND:-}" ]; then
    printf '%s\n' "$ZEO_DYNAMO_ROUTER_COMMAND"
    return
  fi
  if command -v dynamo >/dev/null 2>&1; then
    printf '%s\n' "dynamo serve --config '$config_file'"
    return
  fi
  fail "Dynamo CLI is unavailable. Install NVIDIA Dynamo or set ZEO_DYNAMO_ROUTER_COMMAND to its explicit start command."
}

is_running() {
  [ -f "$pid_file" ] || return 1
  pid=$(cat "$pid_file")
  kill -0 "$pid" 2>/dev/null
}

start() {
  ensure_runtime_dir
  check_environment
  if is_running; then
    printf '%s\n' "zeo-dynamo: router already running with pid $(cat "$pid_file")."
    return
  fi
  rm -f "$pid_file"
  command=$(router_command)
  (
    export ZEO_DYNAMO_MODEL ZEO_LOCAL_ENGINE_URL
    exec sh -c "$command"
  ) >>"$log_file" 2>&1 &
  pid=$!
  printf '%s\n' "$pid" >"$pid_file"
  sleep 1
  if ! kill -0 "$pid" 2>/dev/null; then
    rm -f "$pid_file"
    fail "router exited during startup. Inspect $log_file for the actionable engine error."
  fi
  printf '%s\n' "zeo-dynamo: router started with pid $pid. Logs: $log_file"
}

status() {
  ensure_runtime_dir
  if is_running; then
    printf '%s\n' "zeo-dynamo: router running with pid $(cat "$pid_file")."
    return
  fi
  rm -f "$pid_file"
  printf '%s\n' "zeo-dynamo: router is not running. Use $0 start after setting ZEO_DYNAMO_MODEL and ZEO_LOCAL_ENGINE_URL."
}

stop() {
  ensure_runtime_dir
  if ! is_running; then
    rm -f "$pid_file"
    printf '%s\n' "zeo-dynamo: router is already stopped."
    return
  fi
  pid=$(cat "$pid_file")
  kill "$pid"
  rm -f "$pid_file"
  printf '%s\n' "zeo-dynamo: router stopped."
}

case "$command_name" in
  start) start ;;
  status) status ;;
  stop) stop ;;
  *) fail "usage: $0 [start|status|stop]" ;;
esac
