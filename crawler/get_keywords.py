from krwordrank.word import summarize_with_keywords
import sys

def get_keywords(raw_data, stopwords=[]):
    # 텍스트 파일에서 내용을 읽어옵니다.

    text = raw_data.split('\n')
    keywords = summarize_with_keywords(text, beta=0.995, stopwords=stopwords)

    return keywords.keys()
if __name__ == '__main__':
    get_keywords(sys.argv[1], sys.argv[2])