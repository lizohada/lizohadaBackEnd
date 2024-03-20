def keyword20():
    import os
    from unicode import join_jamos
    from jamo import h2j, j2hcj
    from glob import glob
    import pandas as pd
    from krwordrank.word import KRWordRank
    import re
    
    # 현 경로가 unicode.py와 동일한 위치로 설정되어있어야 함
    # json 파일 있는 경로로 이동
    PATH = os.getcwd() + "\\results"
    os.chdir(PATH)

    df_keywords = pd.DataFrame(columns=['region', 'keywords'])

    def TextRank(region, texts):
        jamo = j2hcj(h2j(region))
        region = join_jamos(jamo)

        min_count = 5   # 단어의 최소 출현 빈도수 (그래프 생성 시)
        max_length = 10 # 단어의 최대 길이

        wordrank_extractor = KRWordRank(min_count=min_count, max_length=max_length)
        beta = 0.85 # 키워드 간의 관련성 가중치 조절
        max_iter = 10 # PageRank 알고리즘 최대 반복 횟수

        keywords, _, _ = wordrank_extractor.extract(texts, beta, max_iter)
        stopwords = {region,'여행','우리','내가','너무','정말','많이','엄청','진짜','있다.','있다','있어','있었','있는','있습니다',
                    '하다.','하다','하는','합니다','그리고','바로','blancbeauty','u200bu200b','URL','네이버','blognavercom',
                    '공유하기','본문','기능','image','신고하기','복사'}
        stopwords.update({word for word in keywords if any(keyword in word for keyword in ['서울','경기','강원','충청','전라','경상','제주','충북','충남','전북','전남','경북','경남'])})

        passwords = {word:score for word, score in sorted(
            keywords.items(), key=lambda x:-x[1])[:300] if not (word in stopwords)}
        passkeywords = [*passwords.keys()] # 추출된 keyword 저장된 리스트

        # 숫자로만 이루어진 keyword 제거
        for i in range(len(passkeywords)-1, -1, -1):
            if passkeywords[i].isdigit():
                del passkeywords[i]

        return passkeywords[:20]

    for filename in glob('*.json'):
        region = filename.split()[0]

        texts = pd.read_json(filename, orient='records')['content'].to_list()
        for i, s in enumerate(texts):
            texts[i] = re.sub(r"[^\uAC00-\uD7A30-9a-zA-Z\s]", "", s)

        keywordTop20 = TextRank(region, texts)
        region_keywords_data = {'region': region, 'keywords': keywordTop20}
        df_keywords = df_keywords.append(region_keywords_data, ignore_index=True)
        
    return df_keywords
