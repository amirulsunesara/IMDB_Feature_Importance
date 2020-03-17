class data_preprocessing():
    #importing all the necessary libraries
    import pandas as pd
    import numpy as np
    import matplotlib as plt
    from sklearn.preprocessing import MinMaxScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import make_scorer, accuracy_score, precision_score, recall_score, f1_score, mean_squared_error,r2_score
    from sklearn.preprocessing import LabelEncoder        
    import xgboost as xgb
 
    #reading different csv files to create dataframe and do pre-processing 
    dataset_akas = pd.read_csv("data/title.akas.csv")
    dataset_basics = pd.read_csv("data/title.basics.csv")
    title_movies_region_rating=pd.read_csv("data/ratings.csv")
    title_movies_region_rating_principals=pd.read_csv("data/principals.csv")
    #revenue_ds=pd.read_csv("data/movies.csv", delimiter=';')
    #filtering important field into dataframe
    titles = dataset_akas.filter(['titleId','title','region','language'], axis=1)
    #considering movies of US region and english movies only
    titles=titles.loc[titles['region']=='US']
    dataset_basics=(dataset_basics[dataset_basics['startYear']!="\\N"])
    dataset_basics.rename(columns={'tconst':'titleId'}, inplace=True)
    dataset_basics=dataset_basics.loc[(dataset_basics['titleType']=='movie')]
    titles= titles[titles.titleId.isin(dataset_basics['titleId'])]
    title_movies_region=pd.merge(titles, dataset_basics, on="titleId")
    #dropping un-necessary columns
    title_movies_region.drop(columns=['region','titleType','primaryTitle','originalTitle','endYear','isAdult'], axis = 1, inplace = True)
    title_movies_region = title_movies_region[title_movies_region["runtimeMinutes"]!="\\N"]
    #renaming necessary columns
    title_movies_region_rating.rename(columns={'tconst':'titleId'}, inplace=True)
    title_movies_region_rating=pd.merge(title_movies_region, title_movies_region_rating, on="titleId")
    title_movies_region_rating_principals.rename(columns={'tconst':'titleId'}, inplace=True)
    title_movies_region_rating_principals= title_movies_region_rating_principals[title_movies_region_rating_principals.titleId.isin(title_movies_region_rating['titleId'])]
    title_movies_region_rating_principals.drop(columns=['characters','job','ordering'], axis = 1, inplace = True)
    title_movies_region_rating_principals=pd.merge(title_movies_region_rating, title_movies_region_rating_principals, on="titleId")
    #revenue_ds = revenue_ds[["revenue","imdb_id"]]
    final_df=title_movies_region_rating_principals
    #print(final_df)
    final_df=final_df.loc[(final_df['category']).isin (['actor','actress','director','writer'])]
    final_df=(final_df[final_df['genres']!="\\N"])
    final_df=final_df.drop(columns=['language'])
    #taking only one genre of movies (multiple categories pf genre available for one movie)
    s1 = final_df.genres.str.split(',', expand=True).stack().str.strip().reset_index(level=1, drop=True)
    df1 = pd.concat([s1], axis=1, keys=['genres'])
    df= final_df.drop(['genres'], axis=1).join(df1).reset_index(drop=True)
    df=df.reset_index(drop=True)
    #df = df.drop(['imdb_id'], axis=1)
    #normalisation of numeric column which are having diffferent scales
    scaler = MinMaxScaler(copy=True, feature_range=(0, 1))
    columns_to_scale = ['averageRating','numVotes','runtimeMinutes']
    df[columns_to_scale] = scaler.fit_transform(df[columns_to_scale])
    df_title_names_id = df.filter(['titleId','title'], axis=1)
    df_categorical = df.filter(['category','genres','numVotes','runtimeMinutes','startYear','averageRating'], axis=1)
    categorical_col = ['category','genres']
    df_categorical.drop_duplicates(inplace = True) 
    df_year = df_categorical.filter(['startYear'], axis=1)
    columns_to_scale = ['startYear']
    df_categorical[columns_to_scale] = scaler.fit_transform(df_categorical[columns_to_scale])
    #saving the clean dataset into a csv file, also saving the range of years available in dataset
    df_year.to_csv("date.csv",index = False)
    df_categorical.to_csv("clean_data.csv",index = False)

    
    
    


