#include "FileSharing.h"

#include <filesystem>
#include <fstream>
#include <stdexcept>
#include <iostream>
#include <vector>
#include <array>

#include <sodium.h>

namespace fs = std::filesystem;

namespace FileSharing {

    // --- Crypto constants ----------------------------------------------------

    static constexpr std::size_t KEY_SIZE   = crypto_aead_xchacha20poly1305_ietf_KEYBYTES;
    static constexpr std::size_t NONCE_SIZE = crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;

    // --- Internal helpers ----------------------------------------------------

    // Make sure libsodium is initialized exactly once.
    void ensureSodiumInitialized() {
        static bool initialized = false;
        static std::once_flag initFlag;

        std::call_once(initFlag, []() {
            if (sodium_init() < 0) {
                // This should never happen unless something is very wrong with the environment.
                throw std::runtime_error("libsodium initialization failed");
            }
            initialized = true;
        });

        if (!initialized) {
            throw std::runtime_error("libsodium not initialized");
        }
    }

    // Derive a fixed-size key from an arbitrary string.
    // In a more advanced setup you might use Argon2 + salt; here we keep it simple and deterministic.
    std::array<unsigned char, KEY_SIZE> deriveKey(const std::string& keyMaterial) {
        ensureSodiumInitialized();

        std::array<unsigned char, KEY_SIZE> key{};
        crypto_generichash(
            key.data(),
            key.size(),
            reinterpret_cast<const unsigned char*>(keyMaterial.data()),
            keyMaterial.size(),
            nullptr,
            0
        );
        return key;
    }

    // Encrypt plaintext -> [nonce || ciphertext+MAC]
    std::vector<unsigned char> encryptBytes(const std::vector<unsigned char>& plaintext,
                                            const std::string& keyMaterial) {
        ensureSodiumInitialized();

        auto key = deriveKey(keyMaterial);

        std::array<unsigned char, NONCE_SIZE> nonce{};
        randombytes_buf(nonce.data(), nonce.size());

        std::vector<unsigned char> ciphertext(
            plaintext.size() + crypto_aead_xchacha20poly1305_ietf_ABYTES
        );

        unsigned long long ciphertextLen = 0;

        if (crypto_aead_xchacha20poly1305_ietf_encrypt(
                ciphertext.data(),
                &ciphertextLen,
                plaintext.data(),
                plaintext.size(),
                nullptr,
                0,
                nullptr,
                nonce.data(),
                key.data()
            ) != 0) {
            throw std::runtime_error("Encryption failed");
        }

        ciphertext.resize(ciphertextLen);

        // Prepend nonce: [nonce || ciphertext]
        std::vector<unsigned char> out;
        out.reserve(NONCE_SIZE + ciphertext.size());
        out.insert(out.end(), nonce.begin(), nonce.end());
        out.insert(out.end(), ciphertext.begin(), ciphertext.end());

        return out;
    }

    // Decrypt [nonce || ciphertext+MAC] -> plaintext
    std::vector<unsigned char> decryptBytes(const std::vector<unsigned char>& blob,
                                            const std::string& keyMaterial) {
        ensureSodiumInitialized();

        if (blob.size() < NONCE_SIZE + crypto_aead_xchacha20poly1305_ietf_ABYTES) {
            throw std::runtime_error("Ciphertext blob too small");
        }

        auto key = deriveKey(keyMaterial);

        std::array<unsigned char, NONCE_SIZE> nonce{};
        std::copy_n(blob.begin(), NONCE_SIZE, nonce.begin());

        std::vector<unsigned char> ciphertext(
            blob.begin() + NONCE_SIZE,
            blob.end()
        );

        std::vector<unsigned char> plaintext(ciphertext.size()); // upper bound
        unsigned long long plaintextLen = 0;

        if (crypto_aead_xchacha20poly1305_ietf_decrypt(
                plaintext.data(),
                &plaintextLen,
                nullptr,
                ciphertext.data(),
                ciphertext.size(),
                nullptr,
                0,
                nonce.data(),
                key.data()
            ) != 0) {
            // Auth failed (wrong key or tampering)
            throw std::runtime_error("Decryption failed (bad key or corrupted data)");
        }

        plaintext.resize(plaintextLen);
        return plaintext;
    }

    // --- Public API ----------------------------------------------------------

    std::vector<std::string> listFiles(const std::string& userDirectory) {
        std::vector<std::string> fileList;
        for (const auto& entry : fs::directory_iterator(userDirectory)) {
            if (!entry.is_regular_file()) continue;
            fileList.push_back(entry.path().string());
        }
        return fileList;
    }

    // Read + decrypt file contents as a std::string
    std::string readFile(const std::string& filePath,
                         const std::string& keyMaterial) {
        std::ifstream file(filePath, std::ios::binary);
        if (!file.is_open()) {
            throw std::runtime_error("Could not open file: " + filePath);
        }

        std::vector<unsigned char> blob(
            (std::istreambuf_iterator<char>(file)),
            std::istreambuf_iterator<char>()
        );
        file.close();

        auto plaintext = decryptBytes(blob, keyMaterial);
        return std::string(plaintext.begin(), plaintext.end());
    }

    // Encrypt + write plaintext to file
    bool writeFile(const std::string& filePath,
                   const std::string& content,
                   const std::string& keyMaterial) {
        try {
            std::vector<unsigned char> plaintext(
                content.begin(),
                content.end()
            );
            auto blob = encryptBytes(plaintext, keyMaterial);

            std::ofstream file(filePath, std::ios::binary);
            if (!file.is_open()) {
                std::cerr << "Could not open file for writing: " << filePath << std::endl;
                return false;
            }

            file.write(reinterpret_cast<const char*>(blob.data()), blob.size());
            file.close();
            return true;
        } catch (const std::exception& e) {
            std::cerr << "Error encrypting/writing file: " << e.what() << std::endl;
            return false;
        }
    }

    // Copy a file from A to B, keeping it encrypted at rest.
    // This reads + decrypts + re-encrypts using the same keyMaterial.
    bool shareFile(const std::string& sourceFilePath,
                   const std::string& destinationFilePath,
                   const std::string& keyMaterial) {
        try {
            // Decrypt source file to plaintext
            std::string plaintext = readFile(sourceFilePath, keyMaterial);

            // Encrypt plaintext and write to destination
            return writeFile(destinationFilePath, plaintext, keyMaterial);
        } catch (const std::exception& e) {
            std::cerr << "Error sharing file: " << e.what() << std::endl;
            return false;
        }
    }

} // namespace FileSharing
