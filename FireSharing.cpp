#include "FileSharing.h"

namespace fs = std::filesystem;

namespace FileSharing {

    std::vector<std::string> listFiles(const std::string& userDirectory) {
        std::vector<std::string> fileList;
        for (const auto& entry : fs::directory_iterator(userDirectory)) {
            fileList.push_back(entry.path().string());
        }
        return fileList;
    }

    std::string readFile(const std::string& filePath) {
        std::ifstream file(filePath);
        if (!file.is_open()) {
            throw std::runtime_error("Could not open file: " + filePath);
        }

        std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
        file.close();
        return content;
    }

    bool writeFile(const std::string& filePath, const std::string& content) {
        std::ofstream file(filePath);
        if (!file.is_open()) {
            std::cerr << "Could not open file for writing: " + filePath << std::endl;
            return false;
        }

        file << content;
        file.close();
        return true;
    }

    bool shareFile(const std::string& sourceFilePath, const std::string& destinationFilePath) {
        try {
            std::string content = readFile(sourceFilePath);
            return writeFile(destinationFilePath, content);
        } catch (const std::exception& e) {
            std::cerr << "Error sharing file: " << e.what() << std::endl;
            return false;
        }
    }

}