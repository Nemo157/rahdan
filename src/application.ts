export interface Application {
  running: boolean
  reload(): void
  run(): Application
  unload(): Application
}
