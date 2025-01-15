#include <iostream>
#include "FileSharing.h"

int main() {
    std::string sourceUsername = "sourceUser";
    std::string destinationUsername = "destinationUser";
    std::string filename = "sharedFile.txt";

    std::string sourceDirectory = "/home/" + sourceUsername;
    std::string destinationDirectory = "/home/" + destinationUsername;

    std::string sourceFilePath = sourceDirectory + "/" + filename;
    std::string destinationFilePath = destinationDirectory + "/" + filename;

    // List files in source user directory
    std::vector<std::string> files = FileSharing::listFiles(sourceDirectory);
    std::cout << "Files in source directory:" << std::endl;
    for (const auto& file : files) {
        std::cout << file << std::endl;
    }

    // Share file from source to destination
    if (FileSharing::shareFile(sourceFilePath, destinationFilePath)) {
        std::cout << "File shared successfully!" << std::endl;
    } else {
        std::cout << "File sharing failed." << std::endl;
    }

    return 0;
}