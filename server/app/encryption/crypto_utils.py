"""
Provides utility functions for encrypting and decrypting ObjectIds.

This module uses the Fernet symmetric encryption scheme from the cryptography
library to securely encrypt and decrypt ObjectIds for safe storage and
transmission.
"""

from cryptography.fernet import Fernet
from bson import ObjectId
from flask import Flask


class CryptoUtils:
    """
    Encapsulates cryptographic operations for encrypting and decrypting ObjectIds.
    """

    def __init__(self, app: Flask = None):
        """
        Initializes the CryptoUtils instance.

        Args:
            app: A Flask app instance, optional. If provided, initializes the
                    cipher using the secret key from the app config.
        """
        self._cipher = None
        self.init_app(app)

    def init_app(self, app: Flask):
        """
        Initializes the cipher using the secret key from the app config.

        Raises:
            ValueError: If the secret key is not found in the app config.
        """
        if app is not None:
            secret_key = app.config.get("CRYPTO_SECRET_KEY")
            if secret_key:
                self._cipher = Fernet(secret_key)
            else:
                raise ValueError("Secret key not found in app config")

    def encrypt_object_id(self, object_id):
        """
        Encrypts an ObjectId using the Fernet cipher.

        Args:
            object_id: The ObjectId to encrypt.

        Returns:
            bytes: The encrypted ObjectId.

        Raises:
            RuntimeError: If the CryptoUtils instance is not initialized properly.
        """
        if self._cipher:
            encrypted_id = self._cipher.encrypt(str(object_id).encode())
            return encrypted_id
        raise RuntimeError("CryptoUtils not initialized properly")

    def decrypt_object_id(self, encrypted_id):
        """
        Decrypts an encrypted ObjectId using the Fernet cipher.

        Args:
            encrypted_id: The encrypted ObjectId to decrypt.

        Returns:
            ObjectId: The decrypted ObjectId.

        Raises:
            RuntimeError: If the CryptoUtils instance is not initialized properly.
        """
        if self._cipher:
            decrypted_id = self._cipher.decrypt(encrypted_id).decode()
            return ObjectId(decrypted_id)
        raise RuntimeError("CryptoUtils not initialized properly")
