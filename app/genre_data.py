import pandas as pd
import numpy as np 
import os
class genre_data():
    file_name = os.getcwd()+"/app/data/title.basics.csv"
    file_name_2 = os.getcwd()+"/app/data/ratings.csv"
    genre_data = pd.read_csv(file_name)
    ratings_data = pd.read_csv(file_name_2)
    genre_data = genre_data.drop(columns=['primaryTitle','originalTitle','isAdult','originalTitle','endYear','runtimeMinutes'])
    ##result for all data
    result = {"tconst":[],"titleType":[],"startYear":[],"genres":[]}
    for x in range(2000):
        genre = genre_data["genres"].loc[x].split(",")
        if genre[0] != "\\N":
            for data in genre:
                result["tconst"].append(genre_data["tconst"].loc[x])
                result["titleType"].append(genre_data["titleType"].loc[x])
                result["startYear"].append(genre_data["startYear"].loc[x])
                result["genres"].append(data)
    final_pd = pd.DataFrame(result)
    ##result for all Unique Genre
    result_unique_genre = {"genres":[]}
    result_unique_genre["genres"] = list(final_pd["genres"].unique())
    
    ##result for number of elements per genre
    num_result = {}
    bar_result = {}
    ratings_result = {}
    full_result = {}
    for d in result_unique_genre["genres"]:
       genre_group = final_pd[final_pd["genres"] == d]["tconst"].values
       num_result[d] = len(final_pd[final_pd["genres"] == d])
       sum_val = 0
       for mv_name in genre_group:
           ratings_values = ratings_data[ratings_data["tconst"] == mv_name]["averageRating"]
           if len(ratings_values) == 1:
               sum_val = sum_val + ratings_values.values[0] 
       average_ratings = round(sum_val/(len(genre_group)),1)
       ratings_result[d] = average_ratings
       unique_values = final_pd.loc[final_pd['genres'] == d]["startYear"].unique()
       dates = list(final_pd.loc[final_pd['genres'] == d]["startYear"].values)
       dates = [int(i) for i in dates]
       value_count = {}
       for uv in unique_values:
           value_count[int(uv)] = dates.count(int(uv))
       bar_result[d] = value_count
    full_result["size"] = num_result
    full_result["ratings"] = ratings_result