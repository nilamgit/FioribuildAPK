//  Copyright © 2016 SAP. All rights reserved.

#import "X509FileCertProvider.h"

//do not localize the below string constant
static NSString* const ProviderId = @"com.sap.x509filecertprovider";
static NSString* const kCertificateLabelParam = @"label";
static NSString* const kCertificatePathParam = @"path";
static NSString* const kCertificatePasswordParam = @"password";
static NSString* const kDefaultFileCertificateLabel = @"x509FileCertificateIdentity";

@implementation X509FileCertProvider

- (void) initialize:(NSDictionary*)option withCompletion:(void(^)(SecIdentityRef identityRef, NSError* error))completion {
    NSError* err = nil;
    [self setParameters:option failedWithError:&err];
    
    //if certificate is already provisioned, load and return it
    SecIdentityRef identity = nil;
    [self getStoredCertificate:&identity error:&err];
    if (identity != nil){
        completion(identity, nil);
    }
    else if (err != nil){
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            completion(nil, err);
        });
    }
    else{
        //certificate is not yet provisioned, get it from file
        [self getCertificateFromFile:self.path password:self.password label:self.certLabel error:nil withCompletion:completion];
    }
    
}

//method to synchronously get a certificate from saved local copy.
//if saved certicate exists, return true and also set the identityref parameter to the certificate
//If no saved certificate exists, return true and also setting identityRef parameter to nil.
//if error happens during getting the saved certificate, return false with related error, also setting identityRef parameter to nil
- (BOOL) getStoredCertificate:(SecIdentityRef *)pidentityRef error:(NSError**)anError{
    return [SMPKeychainCertProviderPlugin getStoredCertificate:pidentityRef label:self.certLabel error:anError];
}

//method to delete the saved local copy
//if not saved certificate exists, do nothing and return true,
//if saved certificate is deleted, return true
//if saved certificate exists and fails to delete, reture false with error
- (BOOL) deleteStoredCertificateWithError:(NSError**)anError{
    return [SMPKeychainCertProviderPlugin deleteStoredCertificateWithError:self.certLabel error:anError];
}


- (BOOL) setParameters:(NSDictionary*)params failedWithError:(NSError **)error {
    
    if (params != nil){
        if ( [params objectForKey:kCertificateLabelParam] != nil ){
            self.certLabel = params[kCertificateLabelParam];
        }
        else{
            self.certLabel = kDefaultFileCertificateLabel;
        }
        
        if ([params objectForKey:kCertificatePathParam] != nil){
            self.path = params[kCertificatePathParam];
        }
        else{
            self.path = nil;
        }
        
        if ([params objectForKey:kCertificatePasswordParam] != nil){
            self.password = params[kCertificatePasswordParam];
        }
        else{
            self.password = nil;
        }
    }
    return YES;
}


- (NSString*) getProviderID {
    return ProviderId;
}


#pragma mark - File import logic

- (void)getCertificateFromFile:(NSString*)path password:(NSString*)password label:(NSString*)certLabel  error:(NSError*)error
                withCompletion:(void(^)(SecIdentityRef identityRef, NSError* error))completion {
    
    if (error == nil && (path.length != 0) && (password.length != 0)){
        //the configuration is complete, no need to show UI to collect it from user.
        NSError* err = nil;
        [self importClientCertificateFromFile:path password:self.password label:self.certLabel error:&err];
        if (err != nil){
            completion(nil, err);
        }
        else{
            SecIdentityRef identity = nil;
            [self getStoredCertificate:&identity error:&err];
            completion(identity, err);
        }
    }
    else{
        NSString* message;
        if (error == nil){
            message = [[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"please_input_certificate"];
        }
        else if (error.code == ERR_MissingParameter_Error){
            message = [[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"missing_file_path"];
        }
        else if (error.code == ERR_Certificate_File_Not_Exist){
            message = [[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"certificate_not_exist"];
        }
        else if (error.code == ERR_Authentication_Failed){
            message = [[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"password_incorrect"];
        }
        else {
            //unkown err
            message = [[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"fail_to_import_certificate"];
        }
        
        UIAlertController* fileInfoAlert = [UIAlertController alertControllerWithTitle:[[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"import_certificate"] message:message preferredStyle:UIAlertControllerStyleAlert];
        
        [fileInfoAlert addTextFieldWithConfigurationHandler:^(UITextField *textField) {
            textField.placeholder = [[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"file_name"];
            textField.text = path;
        }];
        
        [fileInfoAlert addTextFieldWithConfigurationHandler:^(UITextField *textField) {
            textField.placeholder = [[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"password"];
            textField.secureTextEntry = YES;
            textField.text = nil;
        }];
        
        UIAlertAction* ok = [UIAlertAction
                             actionWithTitle:[[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"ok"]
                             style:UIAlertActionStyleDefault
                             handler:^(UIAlertAction * action)
                             {
                                 UITextField *pathField = fileInfoAlert.textFields[0];
                                 UITextField *passwordField = fileInfoAlert.textFields[1];
                                 
                                 NSString* path = pathField.text;
                                 NSString* password = passwordField.text;
                                 
                                 if (path.length == 0 || password.length == 0){
                                     NSError* err = [SMPKeychainCertProviderPlugin getErrorObject:ERR_MissingParameter_Error message:@"Path or password is empty." status:0];
                                     
                                     [self getCertificateFromFile:path password:password label:certLabel error:err withCompletion:completion];
                                 }
                                 else{
                                     NSError* err = nil;
                                     [self importClientCertificateFromFile:path password:password label:self.certLabel error:&err];
                                     if (err != nil){
                                         [self getCertificateFromFile:path password:password label:certLabel error:err withCompletion:completion];
                                     }
                                     else{
                                         SecIdentityRef identity = nil;
                                         [self getStoredCertificate:&identity error:&err];
                                         completion(identity, err);
                                     }
                                 }
                             }];
        
        UIAlertAction* cancel = [UIAlertAction actionWithTitle:[[SMPKeychainCertProviderPlugin getPlugin] getLocalizedResource:@"cancel"] style:UIAlertActionStyleCancel
                                    handler:^(UIAlertAction * action){
                                            NSError *err = [SMPKeychainCertProviderPlugin getErrorObject:ERR_User_Cancel_Error message:@"Certificate file does not exist." status:0];
                                            completion(nil, err);
                                    }];
        
        [fileInfoAlert addAction:ok];
        [fileInfoAlert addAction:cancel];
        CDVPlugin* plugin = [SMPKeychainCertProviderPlugin getPlugin];
        
        [SMPKeychainCertProviderPlugin getTopViewController:plugin.viewController toPresent:fileInfoAlert];
    }
}

-(NSString*) getFullFilePathIfExisting:(NSString*)filePath {
    //check file exist
    BOOL isDirectory = YES;
    NSString *documentsDirectory = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    NSString * fullPath = [documentsDirectory stringByAppendingPathComponent:filePath];
    
    BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:fullPath isDirectory:&isDirectory];
    
    if (fileExists == NO || isDirectory ){
        NSLog(@"%@: File certificate not found in document directory.  Trying resource folder.", ProviderId);
        //if the file does not exist in document directory, then check the main bundle resource folder
        NSString * resourceFolderPath = [[NSBundle mainBundle] resourcePath];
        fullPath = [resourceFolderPath stringByAppendingPathComponent:filePath];
        
        fileExists = [[NSFileManager defaultManager] fileExistsAtPath:fullPath isDirectory:&isDirectory];
        if (fileExists == NO || isDirectory ){
            NSLog(@"%@: Certificate file does not exist.", ProviderId);
        }
    }
    if (fileExists){
        return fullPath;
    }
    else{
        return nil;
    }
}

//get client certificate from file for authentiation, and also save to a local copy to keychain for later use
-(void) importClientCertificateFromFile:(NSString*)filePath password:(NSString*)password label:(NSString*)certLabel error:(NSError**)err {
    NSString* fullPath = [self getFullFilePathIfExisting:filePath];
    if (fullPath.length == 0){
        NSLog(@"%@: Certificate file does not exist.", ProviderId);
        *err = [SMPKeychainCertProviderPlugin getErrorObject:ERR_Certificate_File_Not_Exist message:@"Certificate file does not exist." status:0];
    }
    else{
        NSData *p12data = [NSData dataWithContentsOfFile:fullPath];
        [SMPKeychainCertProviderPlugin parsePKCS12FileAndAddToKeychain:p12data withPassword:password label:certLabel error:err];
    }
}

@end
