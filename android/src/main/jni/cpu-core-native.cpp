#include <jni.h>
#include <unistd.h>
#include <android/log.h>

#define LOG_TAG "ReactNativeCpuCoreC++"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)

extern "C" JNIEXPORT jlong JNICALL
Java_expo_modules_cpucore_ReactNativeCpuCoreModule_getClockTicksPerSecondNative(JNIEnv *env, jobject thiz) {
    LOGD("getClockTicksPerSecondNative called");

    long clockTicks = sysconf(_SC_CLK_TCK);

    LOGD("sysconf(_SC_CLK_TCK) returned: %ld", clockTicks);

    if (clockTicks <= 0) {
        LOGE("sysconf returned invalid value: %ld", clockTicks);
        return 100; // Default fallback for Android
    }

    LOGI("Clock ticks per second: %ld", clockTicks);
    return (jlong)clockTicks;
}
