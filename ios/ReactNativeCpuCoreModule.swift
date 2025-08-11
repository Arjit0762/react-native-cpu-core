import Darwin
import ExpoModulesCore
import Foundation

public class ReactNativeCpuCoreModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ReactNativeCpuCore')` in JavaScript.
    Name("ReactNativeCpuCore")

    Function("getClockTicksPerSecond") { () -> Int in
      // iOS doesn't use clock ticks in the same way; return a reasonable default
      return 100
    }

    AsyncFunction("getCpuUsage") { (promise: Promise) in
      Task {
        do {
          let usage = try await self.getAppCpuUsage()
          promise.resolve(usage)
        } catch {
          promise.reject("ERR_CPU_USAGE", "Failed to read CPU usage: \(error.localizedDescription)")
        }
      }
    }
  }

  private func getAppCpuUsage() async throws -> Double {
    return try await withCheckedThrowingContinuation { continuation in
      DispatchQueue.global(qos: .userInitiated).async {
        do {
          let usage = try self.getCurrentCpuUsage()
          continuation.resume(returning: usage)
        } catch {
          continuation.resume(throwing: error)
        }
      }
    }
  }

  private func getCurrentCpuUsage() throws -> Double {
    var info = mach_task_basic_info()
    var count = mach_msg_type_number_t(
      MemoryLayout<mach_task_basic_info>.size / MemoryLayout<integer_t>.size)

    let result = withUnsafeMutablePointer(to: &info) { infoPtr in
      infoPtr.withMemoryRebound(to: integer_t.self, capacity: Int(count)) { intPtr in
        task_info(mach_task_self_, task_flavor_t(MACH_TASK_BASIC_INFO), intPtr, &count)
      }
    }

    guard result == KERN_SUCCESS else {
      throw NSError(
        domain: "com.example.cpu", code: Int(result),
        userInfo: [NSLocalizedDescriptionKey: "Failed to get task info"])
    }

    // Get thread info for more accurate CPU usage
    var threadList: thread_act_array_t?
    var threadCount: mach_msg_type_number_t = 0

    let threadResult = task_threads(mach_task_self_, &threadList, &threadCount)
    guard threadResult == KERN_SUCCESS else {
      throw NSError(
        domain: "com.example.cpu", code: Int(threadResult),
        userInfo: [NSLocalizedDescriptionKey: "Failed to get thread info"])
    }

    defer {
      if let threadList = threadList {
        vm_deallocate(
          mach_task_self_, vm_address_t(UInt(bitPattern: threadList)),
          vm_size_t(threadCount * UInt32(MemoryLayout<thread_t>.size)))
      }
    }

    var totalUsage: Double = 0

    for i in 0..<Int(threadCount) {
      var threadInfo = thread_basic_info()
      var threadInfoCount = mach_msg_type_number_t(THREAD_INFO_MAX)

      let threadInfoResult = withUnsafeMutablePointer(to: &threadInfo) { threadInfoPtr in
        threadInfoPtr.withMemoryRebound(to: integer_t.self, capacity: Int(threadInfoCount)) {
          intPtr in
          thread_info(threadList![i], thread_flavor_t(THREAD_BASIC_INFO), intPtr, &threadInfoCount)
        }
      }

      if threadInfoResult == KERN_SUCCESS {
        if threadInfo.flags & TH_FLAGS_IDLE == 0 {
          totalUsage += Double(threadInfo.cpu_usage) / Double(TH_USAGE_SCALE) * 100.0
        }
      }
    }

    #if targetEnvironment(simulator)
      print("CPU Usage (Simulator): \(totalUsage)%")
    #endif

    return min(100.0, totalUsage)
  }

}
