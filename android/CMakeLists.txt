cmake_minimum_required(VERSION 3.4.1)

# Set project name
project(cpucore)

# Add native library
add_library(
    cpu-core-native            # Name of the native library
    SHARED                     # Type: Shared library (.so)
    src/main/jni/cpu-core-native.cpp  # Source file
)

# Find required native libraries
find_library(
    log-lib                    # Name to use in CMake
    log                        # Actual system library name (Android log)
)

# Link the log library with our native library
target_link_libraries(
    cpu-core-native
    ${log-lib}
)
