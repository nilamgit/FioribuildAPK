//
//  NotificationActionBuilderDelegate.h
//
//  Created by SAP on 8/20/19.
//  Copyright © 2019 SAP AG. All rights reserved.

// completion block with error or response for request sent by action notification.
typedef void (^RequestCompletionHandler)(NSError* error, NSDictionary* responseDic);

/**
 The <code>NotificationActionBuilderDelegate</code> is the protocol class of Kapsel SDK to gave developers the ability to produce Rich Notifications. It give the user a quick and easy way to perform relevant tasks in response to a notification.
 
 The concrete class of this protocol should provide the declaring of actionable notification and business logic to reponse the custom action button click event. To enable this function, the name of the concrete class of this protocol should be declared with key 'com.sap.kapsel.push.action.builder' in project's plist file.
 */
@protocol NotificationActionBuilderDelegate <NSObject>

@required

/**
 Constructs the notification actions grouped by the category. See <code>UIMutableUserNotificationCategory</code>
 
 @return a set of notification category. May be nil  and it means no actionable notification will be registered
 */
- (NSSet*) buildNotificationCategories;

/**
 Called when the custom button was clicked from a notification. It was used to handle the business logic for response of an action button was clicked. Your implementation of this method should perform the action associated with the specified identifier. 
 
 It was allow to talk with backend via the 'requestHandler' block passed in and the response will be given to consumer via 'RequestCompletionHandler' after the request was finished. The passed in completionHandler block should be call to notify iOS the handling of the action for the remote notification was done. Your implementation execute the block in the completionHandler parameter as soon as you are done.
 
 If you implementation was sent request over SAP Fiori Cloud(FCE), the 'requestPath' you should use the format like '/sap/fiori/@FioriAppName/@SCPDestination/@BackendAPI'. E,g, '/sap/fiori/carrier/ES5/sap/opu/odata/IWFND/RMTSAMPLEFLIGHT/CarrierCollection?$format=json'
 @FioriAppName was the name of Fiori App you deployed in SCP Portal service via Web-IDE.
 @SCPDestination was the SCP destination which point to real backend
 @BackendAPI was the backend biz API
 If you implementation was sent request over Front End Server, the 'requestPath' you should use the format like '/@BackendAPI'. E,g, '/sap/opu/odata/sap/CRM_BUPA_ODATA/ContactCollection?$format=json'
 
 @param actionIdentifier -- notification action identifier.
 @param userInfo --  dictionary that contains information related to the notification, potentially including a badge number for the app icon, an alert sound, an alert message to display to the user, a notification identifier, and custom data. The provider originates it as a JSON-defined dictionary that iOS converts to an NSDictionary object; the dictionary might contain only property-list objects plus NSNull.
 For Local notification, it was nil if the consume don't set the userInfo to the UNMutableNotificationContent.
 @param responseInfo --  The data dictionary sent by the action for remote notification. It was nil for local notification.
 @param completionHandler -- The block to execute when you are finished performing the specified action. You must call this block at the end of your method.
 @param requestHandler -- The block was used to send request to backend with requestPath, headers, body and the completion block with response.
 */
-(void) handleNotificationAction:(NSString *)actionIdentifier notification:(NSDictionary *)userInfo withResponseInfo:(NSDictionary *)responseInfo completionHandler:(void (^)(void))completionHandler requestHandler:(void(^)(NSString* method, NSString* requestPath, NSMutableDictionary* requestHeader, NSString* requestBody, RequestCompletionHandler requestCompletionHandler))requestHandler;

@end
