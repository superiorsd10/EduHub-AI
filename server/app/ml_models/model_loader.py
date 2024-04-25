"""
Module containing the load_modal function.
"""

import pickle


def load_model():
    """
    Load a machine learning model from a pickled file.

    This function reads a pickled file named "model.pkl" containing a trained machine learning model
    and returns the loaded model object.

    Returns:
        object: The trained machine learning model loaded from the pickled file.

    Raises:
        FileNotFoundError: If the "model.pkl" file is not found in the current directory.
        pickle.UnpicklingError: If there is an error while unpickling the model object.
    """
    try:
        model = pickle.load(open("model.pkl", "rb"))
        return model
    except Exception as error:
        print(f"Error: {error}")
        raise
