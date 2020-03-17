import pandas as pd
import numpy as np 
import os
class exploration():

    ## Function Returns the Unique Years in the data and the amount of movies produced in those years 
    def unique_years(self):
        file_name = os.getcwd()+"/app/data/output_10000.csv"
        exploration_data = pd.read_csv(file_name)
        exploration_data = exploration_data[exploration_data["startYear"] > 1970]
        exploration_data = exploration_data.reset_index(drop=True)
        unique_years = exploration_data["startYear"].unique()
        year_count = {}
        for d in unique_years:
            year_count[int(d)] = len(exploration_data[exploration_data["startYear"]==d]["tconst"].unique())
        return year_count
    
    ## This Function Returns the Unique Genres in the Year and the amount of movies in those Genres
    def get_year_genre_count(self,year):
        file_name = os.getcwd()+"/app/data/output_10000.csv"
        exploration_data = pd.read_csv(file_name)
        exploration_data = exploration_data[exploration_data["startYear"] > 1970]
        exploration_data = exploration_data.reset_index(drop=True)
        df = exploration_data[exploration_data["startYear"]==year]
        unique_genre = df["genres"].unique()
        result = {}
        for d in unique_genre:
            values = df[df["genres"] == d]
            avg_rating = 0
            for x in values["averageRating"].values:
                avg_rating = avg_rating + x
            avg_rating = round(avg_rating/len(values),2)
            result[d] = {"avg_rating":avg_rating,"count":len(values)}
        return result
    ## This function Returns the instances of movies in a particular Genre during a particular year
    def get_instance_on_year_genre(self,year,genre):
        file_name = os.getcwd()+"/app/data/output_10000.csv"
        exploration_data = pd.read_csv(file_name)
        exploration_data = exploration_data[exploration_data["startYear"] > 1970]
        exploration_data = exploration_data.reset_index(drop=True)
        df = exploration_data[exploration_data["startYear"]==year]
        df = df[df["genres"]==genre]
        df = df.reset_index(drop=True)
        return df.to_dict()
    