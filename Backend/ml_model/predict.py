import sys
import math
import random
import string
from collections import Counter, defaultdict
from typing import List, Tuple, Dict, Set

PRIORITY_LABELS = {
    1: "Critical",
    2: "Medium",
    3: "Low"
}

STOPWORDS = set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'in', 'to', 'of', 'for', 'with', 'by', 'as', 'from', 'that', 'this', 'it', 'was', 'were', 'has', 'had', 'have', 'be', 'been', 'are', 'or', 'but', 'not', 'so', 'if', 'then', 'than', 'into', 'out', 'about', 'over', 'under', 'after', 'before', 'between', 'during', 'without', 'within', 'upon', 'against', 'among', 'through', 'per', 'each', 'all', 'any', 'some', 'no', 'nor', 'can', 'will', 'just', 'do', 'does', 'did', 'done', 'should', 'could', 'would', 'may', 'might', 'must', 'shall', 'let', 'us', 'we', 'you', 'he', 'she', 'they', 'them', 'his', 'her', 'their', 'our', 'your', 'my', 'mine', 'yours', 'ours', 'theirs', 'who', 'whom', 'whose', 'which', 'what', 'when', 'where', 'why', 'how', 'i', 'me', 'him', 'itself', 'yourself', 'ourselves', 'themselves', 'herself', 'himself', 'itself', 'myself', 'yourself', 'ourselves', 'themselves'
])

TRAINING_DATA = [
    ("There was a bomb threat at the station", 1),
    ("A murder was reported downtown", 1),
    ("Attempted fraud in the market", 1),
    ("Theft of a bicycle", 2),
    ("Robbery at the bank", 2),
    ("Harassment complaint filed", 2),
    ("Lost wallet", 3),
    ("Noise complaint", 3),
    ("Dog missing", 3),
    ("Explosion in the city center", 1),
    ("Assault in the alley", 2),
    ("Burglary at the residence", 2),
    ("Fight broke out in the bar", 2),
    ("Violence reported in the park", 2),
    ("Abuse case reported", 2),
    ("Kidnap attempt", 1),
    ("Hostage situation", 1),
    ("Gun found in the car", 1),
    ("Threatening messages received", 1),
    ("Suspicious activity", 3),
    ("Vandalism", 3),
    ("Graffiti on wall", 3),
    ("Minor accident", 3),
    ("Public disturbance", 3),
    ("Pickpocketing", 2),
    ("Shoplifting", 2),
    ("Domestic dispute", 2),
    ("Trespassing", 3),
    ("Cyberbullying", 2),
    ("Online scam", 1),
    # ...add 100+ more realistic FIRs for a larger dataset...
]
for i in range(100):
    TRAINING_DATA.append((f"Test FIR description {i}", random.choice([1,2,3])))

# --- Preprocessing and Feature Engineering ---
def clean_text(text: str) -> str:
    text = text.lower()
    return text.translate(str.maketrans('', '', string.punctuation))

def remove_stopwords(tokens: List[str]) -> List[str]:
    return [t for t in tokens if t not in STOPWORDS]

def tokenize(text: str) -> List[str]:
    return text.split()

def ngrams(tokens: List[str], n: int) -> List[str]:
    return ['_'.join(tokens[i:i+n]) for i in range(len(tokens)-n+1)]

def extract_features(description: str, use_ngrams: bool = False) -> Dict[str, int]:
    cleaned = clean_text(description)
    tokens = tokenize(cleaned)
    tokens = remove_stopwords(tokens)
    feats = Counter(tokens)
    if use_ngrams:
        for n in [2, 3]:
            feats.update(ngrams(tokens, n))
    return dict(feats)

def jaccard_similarity(set1: Set[str], set2: Set[str]) -> float:
    intersection = set1 & set2
    union = set1 | set2
    if not union:
        return 0.0
    return len(intersection) / len(union)

# --- ML Algorithms ---
class MockMLClassifier:
    def __init__(self):
        self.class_word_sets = {}
        self.class_counts = Counter()
        self.trained = False
    def fit(self, data: List[Tuple[str, int]]):
        for desc, label in data:
            cleaned = clean_text(desc)
            tokens = set(remove_stopwords(tokenize(cleaned)))
            if label not in self.class_word_sets:
                self.class_word_sets[label] = set()
            self.class_word_sets[label].update(tokens)
            self.class_counts[label] += 1
        self.trained = True
    def predict(self, description: str) -> int:
        if not self.trained:
            raise Exception("Classifier not trained.")
        cleaned = clean_text(description)
        tokens = set(remove_stopwords(tokenize(cleaned)))
        best_label = None
        best_score = -1
        for label, word_set in self.class_word_sets.items():
            score = jaccard_similarity(tokens, word_set)
            if score > best_score:
                best_score = score
                best_label = label
        if best_label is None:
            return 3
        return best_label

class NaiveBayesClassifier:
    def __init__(self):
        self.class_word_counts = defaultdict(Counter)
        self.class_counts = Counter()
        self.vocab = set()
        self.trained = False
    def fit(self, data: List[Tuple[str, int]]):
        for desc, label in data:
            tokens = remove_stopwords(tokenize(clean_text(desc)))
            self.class_word_counts[label].update(tokens)
            self.class_counts[label] += 1
            self.vocab.update(tokens)
        self.trained = True
    def predict(self, description: str) -> int:
        if not self.trained:
            raise Exception("Classifier not trained.")
        tokens = remove_stopwords(tokenize(clean_text(description)))
        scores = {}
        total = sum(self.class_counts.values())
        for label in self.class_counts:
            log_prob = math.log(self.class_counts[label] / total)
            for token in tokens:
                word_count = self.class_word_counts[label][token] + 1
                total_words = sum(self.class_word_counts[label].values()) + len(self.vocab)
                log_prob += math.log(word_count / total_words)
            scores[label] = log_prob
        return max(scores, key=scores.get)

class KNNClassifier:
    def __init__(self, k=3):
        self.k = k
        self.data = []
        self.trained = False
    def fit(self, data: List[Tuple[str, int]]):
        self.data = [(remove_stopwords(tokenize(clean_text(desc))), label) for desc, label in data]
        self.trained = True
    def predict(self, description: str) -> int:
        if not self.trained:
            raise Exception("Classifier not trained.")
        tokens = set(remove_stopwords(tokenize(clean_text(description))))
        sims = []
        for feats, label in self.data:
            sim = len(tokens & set(feats)) / (len(tokens | set(feats)) or 1)
            sims.append((sim, label))
        sims.sort(reverse=True)
        top_k = [label for _, label in sims[:self.k]]
        return Counter(top_k).most_common(1)[0][0]

# --- Model Selection and Evaluation ---
def cross_validate(clf_class, data, folds=5):
    random.shuffle(data)
    fold_size = len(data) // folds
    scores = []
    for i in range(folds):
        test = data[i*fold_size:(i+1)*fold_size]
        train = data[:i*fold_size] + data[(i+1)*fold_size:]
        clf = clf_class() if clf_class != KNNClassifier else clf_class(k=3)
        clf.fit(train)
        correct = 0
        for desc, label in test:
            if clf.predict(desc) == label:
                correct += 1
        scores.append(correct/len(test))
    return sum(scores)/len(scores)

def confusion_matrix(clf, data):
    matrix = defaultdict(lambda: Counter())
    for desc, label in data:
        pred = clf.predict(desc)
        matrix[label][pred] += 1
    return matrix

def print_confusion_matrix(matrix):
    labels = sorted(PRIORITY_LABELS.keys())
    print("Confusion Matrix:")
    print("\t" + "\t".join(str(l) for l in labels))
    for l in labels:
        row = [str(matrix[l][c]) for c in labels]
        print(f"{l}\t" + "\t".join(row))

def evaluate_model(clf, data):
    correct = 0
    for desc, label in data:
        pred = clf.predict(desc)
        if pred == label:
            correct += 1
    acc = correct / len(data)
    matrix = confusion_matrix(clf, data)
    print(f"Accuracy: {acc:.2f}")
    print_confusion_matrix(matrix)
    return acc

# --- CLI and Batch ---
def print_usage():
    print("Usage: python predict.py <description>")
    print("       python predict.py --batch <file.txt>")
    print("       python predict.py --eval <model>")
    print("       python predict.py --cv <model>")
    print("Models: mock, nb, knn")

def main():
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)
    if sys.argv[1] == '--batch' and len(sys.argv) > 2:
        with open(sys.argv[2], 'r') as f:
            lines = [line.strip() for line in f if line.strip()]
        clf = MockMLClassifier()
        clf.fit(TRAINING_DATA)
        for line in lines:
            p = clf.predict(line)
            print(f"{line} => {p} ({PRIORITY_LABELS[p]})")
    elif sys.argv[1] == '--eval' and len(sys.argv) > 2:
        model = sys.argv[2]
        if model == 'mock':
            clf = MockMLClassifier()
        elif model == 'nb':
            clf = NaiveBayesClassifier()
        elif model == 'knn':
            clf = KNNClassifier()
        else:
            print_usage()
            return
        clf.fit(TRAINING_DATA)
        evaluate_model(clf, TRAINING_DATA)
    elif sys.argv[1] == '--cv' and len(sys.argv) > 2:
        model = sys.argv[2]
        if model == 'mock':
            acc = cross_validate(MockMLClassifier, TRAINING_DATA)
        elif model == 'nb':
            acc = cross_validate(NaiveBayesClassifier, TRAINING_DATA)
        elif model == 'knn':
            acc = cross_validate(KNNClassifier, TRAINING_DATA)
        else:
            print_usage()
            return
        print(f"Cross-validated accuracy: {acc:.2f}")
    else:
        input_desc = " ".join(sys.argv[1:])
        clf = MockMLClassifier()
        clf.fit(TRAINING_DATA)
        priority = clf.predict(input_desc)
        print(f"Predicted Priority: {priority} ({PRIORITY_LABELS[priority]})")

if __name__ == "__main__":
    main()
