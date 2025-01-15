#ifndef FILE_SHARING_H
#define FILE_SHARING_H

#include <iostream>
#include <fstream>
#include <filesystem>
#include <vector>
#include <string>

namespace FileSharing {

    // List files in the user directory
    std::vector<std::string> listFiles(const std::string& userDirectory);

    // Read file content
    std::string readFile(const std::string& filePath);

    // Write file content
    bool writeFile(const std::string& filePath, const std::string& content);

    // Share a file from source user to destination user
    bool shareFile(const std::string& sourceFilePath, const std::string& destinationFilePath);

}

#endif // FILE_SHARING_H
