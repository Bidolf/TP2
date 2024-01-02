from csv import DictReader


class CSVReader:
    def __init__(self, path, delimiter=',', quotechar='"'):
        self._path = path
        self._delimiter = delimiter
        self._quotechar = quotechar

    def loop(self):
        with open(self._path, 'r', encoding='utf-8') as file:
            for row in DictReader(file, delimiter=self._delimiter, quotechar=self._quotechar):
                yield row
        file.close()
