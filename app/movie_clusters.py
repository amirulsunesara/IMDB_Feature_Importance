#Reference
#https://www.kaggle.com/ffisegydd/cluster-analysis-of-movies-data


import pandas as pd
import numpy as np 
import os
from sklearn.cluster import DBSCAN
from sklearn.manifold import TSNE
import plotly.graph_objs as go
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
#class defining two clusters
class movie_clusters():
    df_cluster = pd.read_csv(os.getcwd()+"/app/data/directors_ratings.csv")
    df_cluster = df_cluster.drop_duplicates()
    #selecting columns
    df_cluster_training = df_cluster[["primaryName","averageRating"]]
    df_cluster_training_new = pd.get_dummies(df_cluster_training, columns=["primaryName"], prefix=["primaryName"])
    X = StandardScaler().fit_transform(df_cluster_training_new)
    #setting k = 4 to divide ratings in 4 categories
    km = KMeans(n_clusters=4)
    pred = km.fit_predict(X)

    #reduce dimensions using TSNE
    tsne = TSNE(n_components=2)
    tsne_fit = tsne.fit_transform(df_cluster_training_new)
    trace = {}
    trace["x"]=tsne_fit.T[0].tolist() 
    trace["y"]=tsne_fit.T[1].tolist()
    trace["type"]='scatter'
    trace["mode"]='markers'
    trace["name"]=''

    #setting custom text for director
    df_cluster["showString"] = "Director: "+df_cluster["primaryName"].astype(str) +"<br>Average Rating: "+ df_cluster["averageRating"].astype(str)+"<br>Known for movies: "+ df_cluster["knownForTitles"].astype(str)
    trace["text"]=df_cluster["showString"].tolist()
    trace["textposition"]='top left'
    trace["marker"]=dict(color = pred.tolist(), colorscale='Portland',showscale=True)
    clustered_data_director = trace
    df_cluster = pd.read_csv(os.getcwd()+"/app/data/actor_ratings.csv")[0:1200]
    df_cluster = df_cluster.drop_duplicates()
    df_cluster_training = df_cluster[["primaryName","averageRating"]]
    df_cluster_training_new = pd.get_dummies(df_cluster_training, columns=["primaryName"], prefix=["primaryName"])
    X = StandardScaler().fit_transform(df_cluster_training_new)
    km = KMeans(n_clusters=4)
    pred = km.fit_predict(X)
    tsne = TSNE(n_components=2)
    tsne_fit = tsne.fit_transform(df_cluster_training_new)
    trace = {}
    trace["x"]=tsne_fit.T[0].tolist() 
    trace["y"]=tsne_fit.T[1].tolist()
    trace["type"]='scatter'
    trace["mode"]='markers'
    trace["name"]=''

    #setting custom text for actress/actor
    df_cluster["showString"] = "Actor/Actress: "+df_cluster["primaryName"].astype(str) +"<br>Average Rating: "+ df_cluster["averageRating"].astype(str)+"<br>Known for movies: "+ df_cluster["knownForTitles"].astype(str)
    trace["text"]=df_cluster["showString"].tolist()
    trace["textposition"]='top left'
    trace["marker"]=dict(color = pred.tolist(), colorscale='Portland',showscale=True)
    clustered_data_actor = trace

 


  

    
    
    
    