import pickle

def load_model():
    model = pickle.load(open("model.pkl","rb"))
    return model