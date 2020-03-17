from flask import render_template
from app import app
from app.indexData import indexData
from app.api_test_data import api_test_data
from app.exploration import exploration
# from app.genre_data import genre_data
from app.movie_clusters import movie_clusters
from flask import request
from app.data_preprocessing import data_preprocessing
from app.model_training import model_training
from flask import jsonify
from flask import send_file

movie_clusters = movie_clusters()
data = exploration()

@app.route('/')
@app.route('/index')
def index():
    data = indexData()
    return render_template('index.html', title='Home', user=data.user)

@app.route('/test_data', methods=['POST'])
def test_data():
    data = api_test_data()
    print(data.test)
    return jsonify(data.test)

## This Function Returns the years in the dataset and  the number of movies in that year
@app.route('/get_unique_year_count', methods=['GET'])
def get_unique_year_count():
    return jsonify(data.unique_years())

## This returns the genres in a year and the amount of of movies in the genre
@app.route('/get_year_count', methods=['GET'])
def get_year_count():
    year = int(request.args.get('year'))
    return jsonify(data.get_year_genre_count(year))

## This Returns the Instances of a particular genre in a particular year
@app.route('/get_year_genre', methods=['GET'])
def get_year_genre():
    year = int(request.args.get('year'))
    genre = request.args.get('genre')
    return jsonify(data.get_instance_on_year_genre(year,genre))


## This returns the data from the model that was trained 
@app.route('/model_training/<parameters>', methods=['GET'])
def data_processing_test(parameters):
    arrParameters = parameters.split(',')
    print("parameter",arrParameters)
    data = model_training(arrParameters)
    feature_list = data.model()
    return jsonify(feature_list)

## This returns the data for the movie clusters 
@app.route('/movie_clusters', methods=['GET'])
def get_movie_clusters():
    dictClusterData = {}
    dictClusterData["director"]=movie_clusters.clustered_data_director
    dictClusterData["actor"]=movie_clusters.clustered_data_actor
    print(dictClusterData)
    return jsonify(dictClusterData)

## This Returns the data from the parallel coordinates functionality it runs the entire dataset
@app.route('/proj_data')
def proj_data():
    # proj_chart()
    return send_file('../data\\output_10000.csv',
                     mimetype='text/csv',
                     attachment_filename='projections.csv',
                     as_attachment=True)

# @app.route('/prediction_result', methods=['GET'])
# def prediction_result():
#     return jsonify(data.result)