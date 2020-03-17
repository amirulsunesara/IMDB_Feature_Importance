class model_training():

    #importing important libraries
    import numpy as np
    import matplotlib as plt
    from sklearn.preprocessing import MinMaxScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import make_scorer, accuracy_score, precision_score, recall_score, f1_score, mean_squared_error,r2_score
    from sklearn.preprocessing import LabelEncoder
    #function to initialise the class with parameters selected by users at runtime
    def __init__(self,parameters_list):
        self.parameters_list = parameters_list

    #function to split the data
    def datasplitting(param,data,df_date):
        
        from sklearn.model_selection import train_test_split
        #split the data into train and test
        X = data.loc[:, (data.columns != 'averageRating')]
        y = data["averageRating"]
        X_date = df_date
        data_date = {}
        splitdata = train_test_split(X,y,test_size=0.2,random_state=11)
        splitdata_date = train_test_split(X_date,y,test_size=0.2,random_state=11)
        data_date["general"]=splitdata
        data_date["date"]=splitdata_date
        return data_date

    #function to create and train model - XGBoost regressor
    def model_xg(param,data):
        import xgboost as xgb
        import numpy as np
        from sklearn.metrics import make_scorer, accuracy_score, precision_score, recall_score, f1_score, mean_squared_error,r2_score
        X_train, X_test, y_train, y_test=data[0],data[1],data[2],data[3]
        xg_reg = xgb.XGBRegressor(colsample_bytree=0.7,gamma=0.3,max_depth=4,min_child_weight=4,subsample=0.9)
        xg_reg.fit(X_train,y_train)
        names = X_train.columns
        preds_xg = xg_reg.predict(X_test)
        #calculating the accuracy scores
        rmse = np.sqrt(mean_squared_error(y_test, preds_xg))
        #dictinary to add scores and returning it to the front end
        score={}
        print("RMSE: %f" % (rmse))
        r2_scr = r2_score(y_test, preds_xg)
        mean_sq_error = mean_squared_error(y_test, preds_xg)
        print("R2 score ",r2_scr) 
        print("Mean squared error",mean_sq_error)
        score["rmse"] = rmse
        score["r2_score"] = r2_scr
        score["mean_sq_error"] = mean_sq_error
        predxg_classifier = []
        #appending predicted result and score to send it to front end
        y_test = y_test.reset_index(drop=True)
        predxg_classifier.append(y_test)
        predxg_classifier.append(preds_xg)
        predxg_classifier.append(xg_reg)
        predxg_classifier.append(score)
        return predxg_classifier

    #function to read data and calling model training function
    def model(self):
        import pandas as pd
        from app.data_preprocessing import data_preprocessing
        #creating instance of data preprocessing class
        data_prep = data_preprocessing()
        final_param_list = self.parameters_list
        final_param_list.append('averageRating')
        #reading the year csv file to get range of years
        df_date = df_final = pd.read_csv("data/date.csv")
        #reading clean data from csv file
        df_final = pd.read_csv("data/clean_data.csv")
        #filtering the attributes based on attributes selected at run time by user
        df_selected_features = df_final.filter(final_param_list, axis=1)
        #using one hot encoding of categorical column
        df_one_hot = pd.get_dummies(df_selected_features)
        #calling the function to split the data into test and train
        data1=self.datasplitting(df_one_hot,df_date)
        #callind the function to train the model
        model_xgboost = self.model_xg(data1["general"])
        data_date = data1["date"]
        X_train_date, X_test_date, y_train_date, y_test_date=data_date[0],data_date[1],data_date[2],data_date[3]
        X_date_train_data =data1["date"] 
        y_test_gen = model_xgboost[0]
        preds_result = model_xgboost[1]
        #calculating the absolute error between the predicted values and original values of average rating of movies
        #creating a new dataframe for calculating absolute error based on predicted and real values
        df_abs_error = pd.DataFrame({"y_pred": preds_result})
        df_abs_error["y_test"] = y_test_gen
        df_abs_error["absolute_error"] = abs(df_abs_error["y_test"]- df_abs_error["y_pred"])
        df_abs_error["year"] = X_test_date.reset_index(drop=True)
        unique_year = df_abs_error.year.unique()
        unique_year= unique_year.astype(str)
        df_abs_error["year"] = df_abs_error["year"].astype(str)
        df_abs_error_dict = {}
        error = {}
        #creating a dictionary and appending absolute error based on each year
        for y in unique_year:
            dfTemp=df_abs_error.loc[df_abs_error['year']==y]
            if(len(dfTemp)>0):
                error[y] = dfTemp["absolute_error"].tolist()
        model_xg = model_xgboost[2]
        score = model_xgboost[3]
        dats_Col = data1["general"]
        col_names = dats_Col[0].columns
        #calling the function to calculate the importance of each value in multivalued attribute
        feature_and_score_dict = self.modelrunning(model_xg,data_prep.categorical_col,col_names)
        score_list = []
        #appending it into dictinary and array to send it to frontend
        for i in score.keys():
            score_dict = {}
            score_dict["name"] = i
            score_dict["value"] = str(score[i])
            score_list.append(score_dict)

        feature_and_score_dict["score_list"] = score_list
        feature_and_score_dict["absolute_error"] = error

        return feature_and_score_dict
    
    #functiona to calculate feature importance of each variable based on category
    def modelrunning(param,xg_reg,categorical_col,names):

        imp_dict_xg = dict(zip(names,xg_reg.feature_importances_))
        #combining the feature importance value for different values in each categorical column
        for column_name in categorical_col:
            all_values_sum = 0
            for key,value in list(imp_dict_xg.items()):
                if key.startswith(column_name):
                    all_values_sum += imp_dict_xg[key]
                    del(imp_dict_xg[key])
            imp_dict_xg[column_name] = all_values_sum

        importance_data_xg = sorted(list(imp_dict_xg.items()),key=lambda tpl:tpl[1],reverse=True)
        feature_and_score_dict = {}
        imp_feature_list = []
        #generating feature and score list dictionary to pass to front end
        for i in range(0,len(importance_data_xg)):
            imp_feature_dict = {}
            if importance_data_xg[i][1]>0:
                imp_feature_dict["name"]=importance_data_xg[i][0]
                imp_feature_dict["value"]=str(importance_data_xg[i][1])
                imp_feature_list.append(imp_feature_dict)
        
        feature_and_score_dict["features"] =  imp_feature_list
        return feature_and_score_dict
    
  