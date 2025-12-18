namespace FileSharing {

    std::vector<std::string> listFiles(const std::string& userDirectory);

    std::string readFile(const std::string& filePath,
                         const std::string& keyMaterial);

    bool writeFile(const std::string& filePath,
                   const std::string& content,
                   const std::string& keyMaterial);

    bool shareFile(const std::string& sourceFilePath,
                   const std::string& destinationFilePath,
                   const std::string& keyMaterial);
}
