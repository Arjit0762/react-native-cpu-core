package expo.modules.cpucore

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.exception.CodedException
import kotlinx.coroutines.*
import java.io.RandomAccessFile
import android.util.Log
import java.io.IOException

class ReactNativeCpuCoreModule : Module() {
  companion object {
    private const val TAG = "ReactNativeCpuCore"

    init {
      try {
        System.loadLibrary("cpu-core-native")
        Log.d(TAG, "Native library loaded successfully")
      } catch (e: UnsatisfiedLinkError) {
        Log.e(TAG, "Failed to load native library", e)
      }
    }
 
  }

  external fun getClockTicksPerSecondNative(): Long



  override fun definition() = ModuleDefinition {
    Name("ReactNativeCpuCore")
    Function("getClockTicksPerSecond") {
      getClockTicksPerSecondNative()
    }

    AsyncFunction("getCpuUsage") {
      Log.d(TAG, "getCpuUsage called")
      runBlocking(Dispatchers.IO) {
        try {
          Log.d(TAG, "Starting CPU usage calculation for app process")
          val result = readAppCpuUsage()
          Log.d(TAG, "App CPU usage calculated: ${String.format("%.2f", result)}%")
          result
        } catch (e: IOException) {
          Log.e(TAG, "IOException reading CPU stats", e)
          throw CodedException("ERR_CPU_USAGE_IO", "Failed to read CPU stats: ${e.message}", e)
        } catch (e: NumberFormatException) {
          Log.e(TAG, "NumberFormatException parsing CPU stats", e)
          throw CodedException("ERR_CPU_USAGE_PARSE", "Failed to parse CPU stats: ${e.message}", e)
        } catch (e: Exception) {
          Log.e(TAG, "Unexpected error reading CPU usage", e)
          throw CodedException("ERR_CPU_USAGE", "Unknown error reading CPU usage: ${e.message}", e)
        }
      }
    }
  }

  private suspend fun readAppCpuUsage(): Double {
    Log.d(TAG, "Reading first app CPU stat")
    val stat1 = readProcSelfStat()
    val startTime = System.currentTimeMillis()

    Log.d(TAG, "Waiting 1000ms for stable measurement...")
    delay(1000)

    Log.d(TAG, "Reading second app CPU stat")
    val stat2 = readProcSelfStat()
    val endTime = System.currentTimeMillis()

    val cpuTime1 = stat1.utime + stat1.stime
    val cpuTime2 = stat2.utime + stat2.stime
    val cpuTimeDiff = cpuTime2 - cpuTime1

    val elapsedTimeMs = endTime - startTime

    val ticksPerSecond = try {
      val ticks = getClockTicksPerSecondNative()
      if (ticks <= 0) {
        Log.w(TAG, "Invalid ticksPerSecond ($ticks), falling back to 100")
        100L
      } else {
        Log.d(TAG, "Ticks per second from JNI: $ticks")
        ticks
      }
    } catch (e: Exception) {
      Log.w(TAG, "JNI error, falling back to 100 ticks per second", e)
      100L
    }

    val elapsedTicks = (elapsedTimeMs * ticksPerSecond / 1000).toLong()

    Log.d(TAG, "Calculation: cpuTimeDiff=$cpuTimeDiff, elapsedTicks=$elapsedTicks, ticksPerSecond=$ticksPerSecond")

    return if (elapsedTicks > 0) {
      val usage = (100.0 * cpuTimeDiff) / elapsedTicks
      Log.d(TAG, "App CPU usage: ${String.format("%.2f", usage)}%")
      usage.coerceIn(0.0, 100.0)
    } else {
      Log.w(TAG, "No elapsed time detected, returning 0%")
      0.0
    }
  }

  private fun readProcSelfStat(): ProcStat {
    Log.d(TAG, "Opening /proc/self/stat for reading")
    val reader = RandomAccessFile("/proc/self/stat", "r")
    return try {
      val load = reader.readLine() ?: throw IOException("Could not read /proc/self/stat")
      Log.d(TAG, "Raw /proc/self/stat line: $load")

      val toks = load.split("\\s+".toRegex())
      Log.d(TAG, "Parsed tokens: ${toks.size} fields")

      if (toks.size < 15) {
        throw IOException("Invalid /proc/self/stat format: insufficient values (got ${toks.size}, need at least 15)")
      }

      val procStat = ProcStat(
        utime = toks[13].toLong(),
        stime = toks[14].toLong()
      )

      Log.d(TAG, "Created ProcStat: utime=${procStat.utime}, stime=${procStat.stime}")
      procStat
    } catch (e: Exception) {
      Log.e(TAG, "Error reading /proc/self/stat", e)
      throw e
    } finally {
      reader.close()
      Log.d(TAG, "Closed /proc/self/stat file")
    }
  }

  data class ProcStat(
    val utime: Long,
    val stime: Long
  )
}